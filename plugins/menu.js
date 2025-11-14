const fs = require("fs");

module.exports = {
  name: "menu",
  description: "Show menu list",
  command: ["menu", "help"],
  execute: async (sock, msg, args) => {
    let plugins = fs.readdirSync("./plugins").filter(f => f.endsWith(".js"));

    let menuText = "📜 *BOT MENU*\n\n";

    for (let file of plugins) {
      let plg = require(`./${file}`);
      menuText += `🔹 *${plg.name}* — ${plg.description}\n`;
    }

    await sock.sendMessage(msg.key.remoteJid, { text: menuText });
  }
};
