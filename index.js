import pino from 'pino';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import chalk from 'chalk';
import readline from 'readline';
import { makeInMemoryStore, useMultiFileAuthState, fetchLatestBaileysVersion, makeWASocket, PHONENUMBER_MCC, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys';
import NodeCache from 'node-cache';
import Pino from 'pino';
import { generateResponse } from './ai.js';
import { uptime } from './cmds/UPTIME.js';
import { ping } from './cmds/PING.js';

// Charger le fichier package.json
const packageInfo = JSON.parse(fs.readFileSync('./package.json'));

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

    // Envoie un message à l'admin lorsque le bot se connecte
    bot.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;
        if (connection == "open") {
            console.log(chalk.yellow(`🌿 Connected to => ` + JSON.stringify(bot.user, null, 2)));

            // Envoie un message à l'owner pour indiquer que le bot est connecté
            await bot.sendMessage(owner.number, {
                text: `FAMOUS-AI Connected Successfully, version: ${packageInfo.version}`,
            });
        }
        if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
            startBot();
        }
    });

    bot.ev.on('creds.update', saveCreds);

    bot.ev.on('messages.upsert', async chatUpdate => {
        const message = chatUpdate.messages[0];
        if (!message.message || message.key.fromMe || message.key.participant) return; // Ignorer les groupes et messages envoyés par le bot
        const sender = message.key.remoteJid;
        const text = message.message.conversation || message.message.extendedTextMessage?.text;

        if (text) {
            console.log(`Received message from ${sender}: ${text}`);

            // Vérifie si l'utilisateur a envoyé la commande PING ou UPTIME
            if (text.toLowerCase() === "ping") {
                const pingResponse = ping();
                await bot.sendMessage(sender, { text: pingResponse });
                return;
            }

            if (text.toLowerCase() === "uptime") {
                const uptimeResponse = uptime();
                await bot.sendMessage(sender, { text: uptimeResponse });
                return;
            }

            const isFirstInteraction = !firstInteractionCache.get(sender);
            if (isFirstInteraction) {
                firstInteractionCache.set(sender, true);
            }

            const reply = await generateResponse(text, isFirstInteraction);
            await bot.sendMessage(sender, reply);
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
