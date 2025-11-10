const express = require("express");
const { startConnection } = require("./lib/connection");
const { handleMessage } = require("./lib/handlers");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("✅ Mark-MD Bot is running!"));
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));

(async () => {
  const bot = await startConnection();

  bot.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      await handleMessage(bot, msg);
    }
  });
})();
