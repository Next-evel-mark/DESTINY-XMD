module.exports = {
  name: "ping",
  async execute(sock, msg, args, from) {
    const start = Date.now();
    await sock.sendMessage(from, { text: "🏓 Pinging..." });
    const end = Date.now();
    const speed = end - start;
    await sock.sendMessage(from, { text: `✅ Pong! Speed: ${speed}ms` });
  },
};
