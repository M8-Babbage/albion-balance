require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const {
  loadFunctions,
  loadEvents,
  loadCommands,
} = require("./src/utils/loadHandlers.js");
const connectToMongo = require("./mongo.js");

const app = express();

// Web server para Render y UptimeRobot
app.get("/", (req, res) => {
  res.send("Bot is alive!");
});

// Levantar servidor primero
app.listen(process.env.PORT || 3000, () => {
  console.log(`Web server listening on port ${process.env.PORT || 3000}`);
  startBot(); // Iniciar el bot después que el server esté listo
});

async function startBot() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.commands = new Collection();

  loadFunctions(client);
  loadEvents(client);
  loadCommands(client);

  try {
    await connectToMongo(process.env.MONGODB_URL);
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error al conectar a la base de datos.", error);
  }

  try {
    await client.login(process.env.BOT_TOKEN);
    console.log("Bot iniciado en Discord");
  } catch (error) {
    console.error("Error al iniciar sesión del bot", error);
  }
}
