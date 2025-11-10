module.exports.antiCall = async (bot, json) => {
  try {
    const from = json.from;
    await bot.sendMessage(from, { text: "🚫 Sorry, calling the bot is not allowed!" });
  } catch (err) { console.error(err); }
};
