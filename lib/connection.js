const { default: giftedConnect, makeCacheableSignalKeyStore } = require("gifted-baileys");
const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const { SESSION_ID } = require("../variables/session");

async function startConnection() {
  if (!SESSION_ID || SESSION_ID === "PUT_YOUR_SESSION_ID_HERE") {
    console.error("❌ Please fill your SESSION_ID in variables/session.js");
    process.exit(1);
  }

  const sessionDir = path.join(__dirname, "../session");
  await fs.ensureDir(sessionDir);
  const credsFile = path.join(sessionDir, `${SESSION_ID}.json`);

  if (!fs.existsSync(credsFile)) {
    await fs.writeJson(credsFile, {
      creds: {
        clientId: SESSION_ID,
        clientToken: SESSION_ID,
        serverToken: SESSION_ID,
        encKey: SESSION_ID,
        macKey: SESSION_ID
      },
      keys: {}
    });
  }

  const bot = giftedConnect({
    logger: pino({ level: "silent" }),
    browser: ["Mark-MD", "Chrome", "1.0.0"],
    auth: { creds: require(credsFile), keys: makeCacheableSignalKeyStore({}, pino()) },
    markOnlineOnConnect: true
  });

  bot.ev.on("creds.update", async () => {
    await fs.writeJson(credsFile, bot.auth.creds, { spaces: 2 });
  });

  return bot;
}

module.exports = { startConnection };
