const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

module.exports = (client) => {
  client.handleCommands = async (
    commandFolders,
    commandFilesRoot,
    commandsPath
  ) => {
    client.commandArray = [];

    // Recorremos los archivos de la carpeta commands

    for (const file of commandFilesRoot) {
      const command = require(path.join(commandsPath, file));
      if (command?.data?.name) {
        client.commands.set(command.data.name, command);
        client.commandArray.push(command.data.toJSON());
      } else {
        console.warn(`⚠️ Comando invalido en raiz/${file}`);
      }
    }

    // Recorremos las subcarpetas de commands y sus archivos (Ej: commands/economy/work.js)

    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      const commandFiles = fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const command = require(path.join(folderPath, file));
        if (command?.data?.name) {
          client.commands.set(command.data.name, command);
          client.commandArray.push(command.data.toJSON());
        } else {
          console.warn(`⚠️ Comando invalido en ${folder}/${file}`);
        }
      }
    }

    const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

    try {
      const route = guildId
        ? Routes.applicationGuildCommands(clientId, guildId)
        : Routes.applicationCommands(clientId);

      await rest.put(route, {
        body: client.commandArray,
      });

      console.log(
        `✅ Se registraron ${client.commandArray.length} comandos ${
          guildId ? `en el servidor ${guildId}` : "globalmente"
        }.\n`
      );
    } catch (error) {
      console.error(
        `❌ Error al registrar comandos ${
          guildId ? `en el servidor ${guildId}` : "globalmente"
        }:`,
        error
      );
    }
  };
};
