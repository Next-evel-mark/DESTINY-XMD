const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("gifted-baileys");
const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const { SESSION_ID } = require("../variables/session");

async function startConnection() {
  if (!SESSION_ID || SESSION_ID === "PASTE_YOUR_SESSION_ID_HERE") {
    console.log("❌ Please add your SESSION_ID in variables/session.js first.");
    process.exit(0);
  }

  // Create a temporary auth folder
  const sessionDir = path.join(__dirname, "../session");
  await fs.ensureDir(sessionDir);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  const { version } = await fetchLatestBaileysVersion();

  // Restore creds from SESSION_ID
  try {
    const decoded = Buffer.from(SESSION_ID, "base64").toString("utf-8");
    const creds = JSON.parse(decoded);
    await fs.writeJson(path.join(sessionDir, "creds.json"), creds);
  } catch {
    console.log("⚠️ Invalid session ID. Please make sure it’s from a valid generator.");
    process.exit(0);
  }

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["Mark-MD", "Chrome", "1.0.0"],
    auth: state,
    version,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) {
        console.log("🔴 Session expired. Generate a new one.");
      } else {
        console.log("🔄 Reconnecting...");
        startConnection();
      }
    } else if (connection === "open") {
      console.log("✅ Mark-MD Connected Successfully!");
    }
  });

  return sock;
}

module.exports = { startConnection };
