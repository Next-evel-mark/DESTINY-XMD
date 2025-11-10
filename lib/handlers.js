const { PREFIX } = require("../variables/session");
const menu = require("./plugins/menu");
const ping = require("./plugins/ping");

async function handleMessage(sock, msg) {
  if (!msg.message) return;
  const type = Object.keys(msg.message)[0];
  const text =
    msg.message.conversation ||
    msg.message[type]?.text ||
    msg.message[type]?.caption ||
    "";

  if (!text.startsWith(PREFIX)) return;
  const command = text.slice(PREFIX.length).trim().split(/ +/).shift().toLowerCase();

  switch (command) {
    case "menu":
      return await menu(sock, msg);
    case "ping":
      return await ping(sock, msg);
  }
}

module.exports = { handleMessage };
