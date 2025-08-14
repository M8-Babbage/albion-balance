require("dotenv").config();
const {
  loadFunctions,
  loadEvents,
  loadCommands,
} = require("./src/utils/loadHandlers.js");
const connectToMongo = require("./mongo.js");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Bot en ejecución 🚀");
});

const PORT = process.env.PORT || 3000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

(async () => {
  loadFunctions(client);
  loadEvents(client);
  loadCommands(client);

  try {
    await connectToMongo(process.env.MONGODB_URL);
  } catch (error) {
    console.error("Error al conectar a la base de datos.", error);
  }

  try {
    await client.login(process.env.BOT_TOKEN);
    console.log("Bot iniciado correctamente ✅");

    // Solo iniciar el servidor web después de que el bot esté listo
    app.listen(PORT, () => {
      console.log(`Servidor web escuchando en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar sesión del bot", error);
  }
})();
