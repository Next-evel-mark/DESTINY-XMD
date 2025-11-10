module.exports = async (bot, ms) => {
  const from = ms.key.remoteJid;
  const start = Date.now();
  await bot.sendMessage(from, { text: "🏓 Pinging..." }, { quoted: ms });
  const latency = Date.now() - start;
  await bot.sendMessage(from, { text: `✅ Pong! ${latency}ms` }, { quoted: ms });
};
