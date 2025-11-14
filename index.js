const {
  default: makeWASocket,
  fetchLatestWaWebVersion,
  DisconnectReason
} = require("gifted-baileys");

const pino = require("pino");
const fs = require("fs");

// ===============================
// CUSTOMISE THIS
// ===============================
const prefix = ".";
const session_id = process.env.SESSION_ID || "PUT-YOUR-SESSION-ID-HERE";
// ===============================

// 🔥 Plugin Loader
let plugins = {};
function loadPlugins() {
  const pluginFiles = fs.readdirSync("./plugins").filter(f => f.endsWith(".js"));
  pluginFiles.forEach((file) => {
    const plugin = require(`./plugins/${file}`);
    plugin.command.forEach(cmd => plugins[cmd] = plugin);
  });
  console.log("🔌 Plugins loaded:", Object.keys(plugins));
}

loadPlugins();

async function connectBot() {
  console.log("🚀 Starting Session ID Bot...");

  const auth = {
    type: "simple",
    session: session_id
  };

  const { version } = await fetchLatestWaWebVersion();

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: auth,
    browser: ["Session Bot", "Chrome", "1.0.0"],
    version
  });

  // Connection handler
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ Bot connected.");
    }

    if (connection === "close") {
      const reason =
        lastDisconnect?.error?.output?.statusCode ||
        lastDisconnect?.error?.output?.payload?.statusCode;

      if (reason === DisconnectReason.loggedOut) {
        console.log("❌ Invalid Session ID.");
      } else {
        console.log("♻️ Reconnecting...");
        connectBot();
      }
    }
  });

  // Message handler
  sock.ev.on("messages.upsert", async (msgUpdate) => {
    const msg = msgUpdate.messages[0];
    if (!msg?.message) return;

    const from = msg.key.remoteJid;

    let text = msg.message?.conversation ||
               msg.message?.extendedTextMessage?.text || "";

    if (!text.startsWith(prefix)) return;

    const args = text.slice(1).trim().split(" ");
    const cmd = args.shift().toLowerCase();

    // Run plugin command
    if (plugins[cmd]) {
      try {
        await plugins[cmd].execute(sock, msg, args);
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Error in plugin." });
      }
    }
  });
}

connectBot();
