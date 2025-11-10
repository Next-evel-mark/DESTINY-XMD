// index.js
// WhatsApp MD Bot using SESSION_ID only (No QR, No File)
// © MARK TECH | DESTINY XMD

const {
  default: makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const fs = require("fs-extra");

// ==== BOT SETTINGS ====
const BOT_NAME = "CKAY-XMD";
const OWNER_NAME = "MARK TECH";
const OWNER_NUMBER = "254110550356"; // your number
const PREFIX = ".";
const SESSION_ID = ""; // paste your base64 session string here
// =======================

if (!SESSION_ID) {
  console.log("❌ Please paste your SESSION_ID in index.js before running the bot!");
  process.exit(1);
}

function decodeSession(sessionString) {
  try {
    const decoded = Buffer.from(sessionString, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch (err) {
    console.error("❌ Invalid SESSION_ID format. Must be valid base64 JSON.");
    process.exit(1);
  }
}

async function startBot() {
  console.log(`🚀 Starting ${BOT_NAME} with Session ID...`);

  const creds = decodeSession(SESSION_ID);
  const { version } = await fetchLatestBaileysVersion();

  const state = { creds, keys: {} };
  const saveCreds = async () => {}; // disable saving

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: [BOT_NAME, "Chrome", "1.0"],
    version,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "open") console.log(`✅ ${BOT_NAME} Connected`);
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) {
        console.log("❌ Session expired. Generate a new SESSION_ID.");
      } else startBot();
    }
  });

  // === Load Commands ===
  const commands = {};
  if (fs.existsSync("./commands")) {
    const cmdFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
    for (const file of cmdFiles) {
      const cmd = require(`./commands/${file}`);
      commands[cmd.name] = cmd;
    }
  }

  // === Message Listener ===
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (!text.startsWith(PREFIX)) return;
    const args = text.slice(PREFIX.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const cmd = commands[cmdName];

    if (!cmd) return;

    try {
      await cmd.execute(sock, msg, args, from);
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: "⚠️ Command error!" });
    }
  });
}

startBot();
