const { PREFIX } = require("../variables/session");
const menu = require("./plugins/menu");
const ping = require("./plugins/ping");

async function handleMessage(bot, ms) {
  if (!ms?.message || ms.key.fromMe) return;

  const messageType = Object.keys(ms.message)[0];
  let body = "";

  if (messageType === "conversation") body = ms.message.conversation;
  if (messageType === "extendedTextMessage") body = ms.message.extendedTextMessage.text;

  const isCommand = body.startsWith(PREFIX);
  const command = isCommand ? body.slice(PREFIX.length).trim().split(" ")[0].toLowerCase() : "";

  const from = ms.key.remoteJid;

  // commands
  if (command === "menu") await menu(bot, ms);
  if (command === "ping") await ping(bot, ms);

  // auto-read
  try { await bot.readMessages([ms.key]); } catch {}
}

module.exports = { handleMessage };
