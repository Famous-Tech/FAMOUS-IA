import pino from 'pino';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import readline from 'readline';
import { makeInMemoryStore, useMultiFileAuthState, fetchLatestBaileysVersion, makeWASocket, PHONENUMBER_MCC, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys';
import NodeCache from 'node-cache';
import Pino from 'pino';
import { generateResponse } from './ai.js'; // appelle au fichier ai.js

const store = makeInMemoryStore({
    logger: pino().child({
        level: 'silent',
        stream: 'store'
    })
});

let phoneNumber = "50943782508"; // Numéro de téléphone par défaut
let owner = JSON.parse(fs.readFileSync('./database/owner.json'));

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => {
    if (!rl.closed) {
        rl.question(text, resolve);
    } else {
        resolve(phoneNumber);
    }
});

const firstInteractionCache = new NodeCache({ stdTTL: 600 }); // Cache pour gérer la première interaction
const messageCounter = new NodeCache({ stdTTL: 60 }); // Compteur de messages par minute
const errorMessageCache = new NodeCache({ stdTTL: 60 }); // Cache pour éviter les messages d'erreur en boucle

async function startBot() {
    let { version, isLatest } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(`./session`);
    const msgRetryCounterCache = new NodeCache();

    const bot = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            let jid = jidNormalizedUser(key.remoteJid);
            let msg = await store.loadMessage(jid, key.id);
            return msg?.message || "";
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
    });

    store.bind(bot.ev);

    if (pairingCode && !bot.authState.creds.registered) {
        if (useMobile) throw new Error('Cannot use pairing code with mobile api');

        let phoneNumberInput;
        const timeout = setTimeout(() => {
            phoneNumberInput = phoneNumber;
            console.log(chalk.bgBlack(chalk.greenBright(`Using default phone number: ${phoneNumber}`)));
        }, 30000);

        phoneNumberInput = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFor example: +50943782508 : `)));
        clearTimeout(timeout);
        phoneNumberInput = phoneNumberInput.replace(/[^0-9]/g, '');

        if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumberInput.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +50943782508")));
            phoneNumberInput = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number +6286\nFor example: +50943782508 : `)));
            phoneNumberInput = phoneNumberInput.replace(/[^0-9]/g, '');
        }

        setTimeout(async () => {
            let code = await bot.requestPairingCode(phoneNumberInput);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)));
        }, 3000);
    }

    console.log("Connexion à WhatsApp ⌛");

    bot.ev.on('messages.upsert', async chatUpdate => {
        console.log("En attente de la réception d'un nouveau message...");

        const message = chatUpdate.messages[0];
        if (!message.message) return;
        const sender = message.key.remoteJid;
        const text = message.message.conversation || message.message.extendedTextMessage?.text;

        // Ignorer les messages du bot lui-même
        if (sender === bot.user.id) return;

        // Ignorer les images, vidéos et stickers
        if (message.message.imageMessage || message.message.videoMessage || message.message.stickerMessage) {
            return;
        }

        if (text) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');

            console.log(`Nouveau message de ${sender} | Type de message : ${message.message.type} | Heure : ${hours}h ${minutes}mn ${seconds}s | Contenu : ${text}`);

            const isFirstInteraction = !firstInteractionCache.get(sender);
            if (isFirstInteraction) {
                firstInteractionCache.set(sender, true);
            }

            // Limitation du nombre de messages par minute
            const messageCount = messageCounter.get(sender) || 0;
            if (messageCount >= 10) {
                if (!errorMessageCache.get(sender)) {
                    await bot.sendMessage(sender, { text: "Je suis désolé, je ne peux pas répondre à plus de 10 messages par minute. Veuillez réessayer plus tard." });
                    errorMessageCache.set(sender, true);
                }
                return;
            }
            messageCounter.set(sender, messageCount + 1);

            // Activation du bot dans les groupes
            if (sender.endsWith('@g.us')) {
                const groupMembers = await bot.groupMetadata(sender).then(metadata => metadata.participants.map(p => p.id));
                if (!groupMembers.includes(`${phoneNumber}@s.whatsapp.net`) || text !== '.on') {
                    return;
                }
            }

            // Réponse à la commande .ping
            if (sender === `${phoneNumber}@s.whatsapp.net` && text === '.ping') {
                const startTime = new Date();
                await bot.sendMessage(sender, { text: "Pong!" });
                const endTime = new Date();
                const responseTime = endTime - startTime;
                await bot.sendMessage(sender, { text: `Temps de réponse : ${responseTime} ms` });
                return;
            }

            // Utilisation de l'IA pour générer une réponse avec support multilingue (Français, Anglais, Créole)
            const reply = await generateResponse(text, String(sender.split('@')[0]), isFirstInteraction);
            await bot.sendMessage(sender, reply);
        }
    });

    bot.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;
        if (connection == "open") {
            console.log(chalk.yellow(`🌿Connected to => ` + JSON.stringify(bot.user, null, 2)));

            // Envoi d'un message de confirmation à $phoneNumber
            const packageJsonPath = path.resolve(__dirname, 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const packageVersion = packageJson.version;
            await bot.sendMessage(phoneNumber + "@s.whatsapp.net", {
                text: `FAMOUS-IA activé avec succès | Version : ${packageVersion}`
            });
        }
        if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
            startBot();
        }
    });

    bot.ev.on('creds.update', saveCreds);

    // Gestion des messages supprimés
    bot.ev.on('messages.update', async (updates) => {
        for (const update of updates) {
            if (update.update.status === 'deleted') {
                const sender = update.key.remoteJid;
                const messageId = update.key.id;
                const deletedMessage = await store.loadMessage(sender, messageId);

                if (deletedMessage) {
                    await bot.sendMessage(phoneNumber + "@s.whatsapp.net", {
                        text: `Message supprimé de ${sender} | ID : ${messageId} | Contenu : ${deletedMessage.message.conversation || deletedMessage.message.extendedTextMessage?.text}`
                    });
                }
            }
        }
    });
}

startBot();

process.on('uncaughtException', function (err) {
    let e = String(err);
    if (e.includes("conflict")) return;
    if (e.includes("Socket connection timeout")) return;
    if (e.includes("not-authorized")) return;
    if (e.includes("already-exists")) return;
    if (e.includes("rate-overlimit")) return;
    if (e.includes("Connection Closed")) return;
    if (e.includes("Timed Out")) return;
    if (e.includes("Value not found")) return;
    console.log('Caught exception: ', err);
});
