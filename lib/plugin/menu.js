module.exports = async (bot, ms) => {
  const from = ms.key.remoteJid;
  const text = `
*📌 MARK-MD BOT MENU*
1. !menu - Show this menu
2. !ping - Check bot latency
`;
  await bot.sendMessage(from, { text }, { quoted: ms });
};
