require('./settings')
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const readline = require("readline")
const { makeInMemoryStore, useMultiFileAuthState, fetchLatestBaileysVersion, makeWASocket, PHONENUMBER_MCC } = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
const Pino = require("pino")
const { generateResponse } = require('./ai');

const store = makeInMemoryStore({
    logger: pino().child({
        level: 'silent',
        stream: 'store'
    })
})

let phoneNumber = "50943782508"
let owner = JSON.parse(fs.readFileSync('./database/owner.json'))

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

const firstInteractionCache = new NodeCache({ stdTTL: 600 }); // Cache pour gérer la première interaction

async function startBot() {
    let { version, isLatest } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(`./session`)
    const msgRetryCounterCache = new NodeCache()

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
            let jid = jidNormalizedUser(key.remoteJid)
            let msg = await store.loadMessage(jid, key.id)
            return msg?.message || ""
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
    })

    store.bind(bot.ev)

    if (pairingCode && !bot.authState.creds.registered) {
        if (useMobile) throw new Error('Cannot use pairing code with mobile api')

        let phoneNumberInput
        const timeout = setTimeout(() => {
            phoneNumberInput = phoneNumber
            console.log(chalk.bgBlack(chalk.greenBright(`Using default phone number: ${phoneNumber}`)))
        }, 30000)

        phoneNumberInput = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFor example: +2348108395270 : `)))
        clearTimeout(timeout)
        phoneNumberInput = phoneNumberInput.replace(/[^0-9]/g, '')

        if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumberInput.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +2348108395270")))
            phoneNumberInput = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number +6286\nFor example: +2348108395270 : `)))
            phoneNumberInput = phoneNumberInput.replace(/[^0-9]/g, '')
            rl.close()
        }

        setTimeout(async () => {
            let code = await bot.requestPairingCode(phoneNumberInput)
            code = code?.match(/.{1,4}/g)?.join("-") || code
            console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
        }, 3000)
    }

    bot.ev.on('messages.upsert', async chatUpdate => {
        const message = chatUpdate.messages[0]
        if (!message.message) return
        const sender = message.key.remoteJid
        const text = message.message.conversation || message.message.extendedTextMessage?.text

        if (text) {
            console.log(`Received message from ${sender}: ${text}`)

            const isFirstInteraction = !firstInteractionCache.get(sender);
            if (isFirstInteraction) {
                firstInteractionCache.set(sender, true);
            }

            // Utilisation de l'IA pour générer une réponse
            const replyText = await generateResponse(text, isFirstInteraction);
            await bot.sendMessage(sender, { text: replyText });
        }
    })

    bot.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s
        if (connection == "open") {
            console.log(chalk.yellow(`🌿Connected to => ` + JSON.stringify(bot.user, null, 2)))
        }
        if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
            startBot()
        }
    })

    bot.ev.on('creds.update', saveCreds)
}

startBot()

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})

process.on('uncaughtException', function (err) {
    let e = String(err)
    if (e.includes("conflict")) return
    if (e.includes("Socket connection timeout")) return
    if (e.includes("not-authorized")) return
    if (e.includes("already-exists")) return
    if (e.includes("rate-overlimit")) return
    if (e.includes("Connection Closed")) return
    if (e.includes("Timed Out")) return
    if (e.includes("Value not found")) return
    console.log('Caught exception: ', err)
})
