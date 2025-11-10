const express = require("express");
const path = require("path");
const { startConnection } = require("./lib/connection");
const { handleMessage } = require("./lib/handlers");
const { antiCall } = require("./lib/anti");

const app = express();
const PORT = process.env.PORT || 4420;

app.use(express.static(path.join(__dirname, "gifted")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "gifted", "gifted.html")));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

(async () => {
  const bot = await startConnection();

  bot.ev.on("messages.upsert", async ({ messages }) => {
    for (const ms of messages) await handleMessage(bot, ms);
  });

  bot.ev.on("call", async (json) => await antiCall(bot, json));

  console.log("✅ Mark-MD Bot is fully online!");
})();
