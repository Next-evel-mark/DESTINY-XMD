module.exports = {
  name: "ping",
  description: "Test bot response",
  command: ["ping"],
  execute: async (sock, msg, args) => {
    await sock.sendMessage(msg.key.remoteJid, { text: "Pong! ✔️" });
  }
};
