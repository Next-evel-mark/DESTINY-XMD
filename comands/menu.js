module.exports = {
  name: "menu",
  async execute(sock, msg, args, from) {
    const menuText = `
*👋 Hey! I'm DESTINY-XMD Bot*
*📛 Owner:* MARK TECH
*💬 Prefix:* .
*🧠 Commands:*
.menu - Show this menu
.ping - Test bot speed
.echo <text> - Repeat your text
.owner - Show owner info
`;
    await sock.sendMessage(from, { text: menuText });
  },
};
