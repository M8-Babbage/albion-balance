const {
  loadFunctions,
  loadEvents,
  loadCommands,
} = require("./src/utils/loadHandlers.js");
const connectToMongo = require("./mongo.js");

const { Client, GatewayIntentBits, Collection } = require("discord.js");

// --- Truco para Render: abrir un servidor web ---
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Bot de Discord corriendo correctamente.");
});

app.listen(PORT, () => {
  console.log(`Servidor HTTP escuchando en puerto ${PORT}`);
});
// -------------------------------------------------

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
  } catch (error) {
    console.error("Error al iniciar sesion del bot", error);
  }
})();
