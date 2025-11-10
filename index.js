// ========== Import Required Modules ==========
const express = require("express");
const fs = require("fs");
const path = require("path");
const pino = require("pino");
const axios = require("axios");
const { Boom } = require("@hapi/boom");
const FileType = require("file-type");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
const { exec } = require("child_process");
const config = require("./config");

// ========== Initialize Express App ==========
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ DESTINY-XMD BOT is Running Successfully!");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// ========== WhatsApp Bot Connection ==========
async function connectToWhatsApp() {
  const { version } = await fetchLatestBaileysVersion();
  console.log(`📡 Using WhatsApp Web v${version.join(".")}`);

  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["DESTINY-XMD", "Chrome", "4.0"]
  });

  // ========== Event: Connection Updates ==========
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "open") {
      console.log("✅ Connected to WhatsApp!");
    } else if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) {
        console.log("❌ Session Logged Out. Please re-scan QR or set a valid SESSION_ID.");
      } else {
        console.log("⚠️ Connection closed, reconnecting...");
        connectToWhatsApp();
      }
    }
  });

  // ========== Event: Message Received ==========
  sock.ev.on("messages.upsert", async (msgUpdate) => {
    const msg = msgUpdate.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    if (!text) return;

    console.log(`💬 Message from ${from}: ${text}`);

    // ========== Example Commands ==========
    if (text === `${config.PREFIX}ping`) {
      await sock.sendMessage(from, { text: "🏓 Pong!" });
    } else if (text === `${config.PREFIX}owner`) {
      await sock.sendMessage(from, { text: `👑 Owner: wa.me/${config.OWNER_NUMBER}` });
    }
  });

  // ========== Save Session Credentials ==========
  sock.ev.on("creds.update", saveCreds);
}

// ========== Start the Bot ==========
connectToWhatsApp().catch(err => console.error("❌ Connection error:", err));
