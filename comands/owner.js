module.exports = {
  name: "owner",
  async execute(sock, msg, args, from) {
    await sock.sendMessage(from, {
      text: `👑 *Owner:* MARK TECH\n📞 *Contact:* wa.me/254110550356\n💬 *Bot:* DESTINY-XMD`,
    });
  },
};
