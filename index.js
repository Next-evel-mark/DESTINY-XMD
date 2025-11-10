import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import express from 'express'
import pino from 'pino'
import path from 'path'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: ['Destiny-XMD', 'Chrome', '1.0.0']
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update
        
        if (qr) {
            console.log('Scan the QR code above')
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Connection closed. Reconnecting:', shouldReconnect)
            if (shouldReconnect) {
                connectToWhatsApp()
            }
        } else if (connection === 'open') {
            console.log('WhatsApp connected successfully!')
        }
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0]
        if (!message.key.fromMe && m.type === 'notify') {
            console.log('Connected:', message)
            // Add your message handling logic here
        }
    })

    return sock
}

// Start WhatsApp connection
connectToWhatsApp().catch(console.error)

// Express server
app.get('/', (req, res) => {
    res.json({ 
        status: 'Bot is running',
        name: 'Mark-MD',
        version: '1.0.0'
    })
})

app.listen(PORT, () => {
    console.log(`Destiny-XMD server running on port ${PORT}`)
})
