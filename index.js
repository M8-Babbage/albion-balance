require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits, Collection } = require("discord.js");

const {
  loadFunctions,
  loadEvents,
  loadCommands,
} = require("./src/utils/loadHandlers.js");
const connectToMongo = require("./mongo.js");

// Crear cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
client.commands = new Collection();

async function startBot() {
  console.log("🚀 Iniciando bot...");

  // 1. Conectar a MongoDB
  try {
    await connectToMongo(process.env.MONGODB_URL);
    console.log("✅ [MongoDB] Conectado exitosamente.");
  } catch (error) {
    console.error("❌ [MongoDB] Error al conectar:", error);
    process.exit(1);
  }

  // 2. Cargar handlers
  try {
    await loadFunctions(client);
    await loadEvents(client);
    await loadCommands(client);
    console.log("✅ [Handlers] Cargados correctamente.");
  } catch (error) {
    console.error("❌ [Handlers] Error al cargar:", error);
    process.exit(1);
  }

  // 3. Iniciar sesión en Discord
  try {
    await client.login(process.env.BOT_TOKEN);
    console.log("✅ [Discord] Bot logueado correctamente.");
  } catch (error) {
    console.error("❌ [Discord] Error al iniciar sesión:", error);
    process.exit(1);
  }

  // 4. Iniciar servidor Express para Render
  const app = express();
  app.get("/", (req, res) => res.send("Bot is running"));
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🌐 Servidor Express escuchando en puerto ${PORT}`);
  });
}

// Arrancar bot
startBot();
