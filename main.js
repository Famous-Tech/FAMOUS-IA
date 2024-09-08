require('./settings');
const pino = require('pino');
const fs = require('fs');
const chalk = require('chalk');
const readline = require("readline");
const { makeInMemoryStore, useMultiFileAuthState, fetchLatestBaileysVersion, makeWASocket, PHONENUMBER_MCC } = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const { generateResponse } = require('./ai');

const store = makeInMemoryStore({
    logger: pino().child({
        level: 'silent',
        stream: 'store'
    })
});

const firstInteractionCache = new NodeCache({ stdTTL: 600 }); // Cache pour gérer la première interaction

async function startBot() {
    let { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(`./session`);
    const msgRetryCounterCache = new NodeCache();

    const bot = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        auth: state,
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
    });

    store.bind(bot.ev);

    // Lors de la réception des messages😪
    bot.ev.on('messages.upsert', async chatUpdate => {
        const message = chatUpdate.messages[0];
        if (!message.message) return;
        const sender = message.key.remoteJid;
        const text = message.message.conversation || message.message.extendedTextMessage?.text;

        if (text) {
            console.log(`Received message from ${sender}: ${text}`);

            const isFirstInteraction = !firstInteractionCache.get(sender);
            if (isFirstInteraction) {
                firstInteractionCache.set(sender, true);
            }

            // Utilisation de l'IA pour générer une réponse
            const response = await generateResponse(text, isFirstInteraction);

            // Envoyer un message avec des boutons si les boutons existent dans la réponse
            if (response.buttons) {
                await bot.sendMessage(sender, {
                    text: response.text,
                    buttons: response.buttons,
                    headerType: response.headerType
                });
            } else {
                await bot.sendMessage(sender, { text: response.text });
            }
        }
    });

    bot.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;
        if (connection === "open") {
            console.log(chalk.yellow(`🌿Connected to => ` + JSON.stringify(bot.user, null, 2)));
        }
        if (connection === "close" && lastDisconnect && lastDisconnect.error?.output?.statusCode !== 401) {
            startBot();
        }
    });

    bot.ev.on('creds.update', saveCreds);
}

startBot();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});
