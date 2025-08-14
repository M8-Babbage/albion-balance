const {
  SlashCommandBuilder,
  EmbedBuilder,
  userMention,
} = require("discord.js");

const Economy = require("../../services/economy.js");
const economy = new Economy();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Transfiere dinero a otro usuario.")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Usuario al que deseas transferir dinero.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de dinero que deseas transferir.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("usuario");
    const amount = interaction.options.getInteger("cantidad");

    const result = await economy.payBalance({
      userSenderId: interaction.user.id,
      userReceiverId: user.id,
      amount: amount,
    });

    if (!result.error) {
      const embed = new EmbedBuilder()
        .setDescription(
          `Has transferido exitosamente **${amount.toLocaleString(
            "es-AR"
          )}** a ${userMention(user.id)}`
        )
        .setColor("Blue");

      return interaction.reply({ embeds: [embed] });
    } else {
      if (result.type === "database-error") {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("Error del sistema. Contacta un admin.")
              .setColor("Red"),
          ],
          flags: 1 << 6,
        });
      } else if (result.type === "invalid-amount") {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("No puedes agregar dinero negativo o cero.")
              .setColor("Red"),
          ],
          flags: 1 << 6,
        });
      } else if (result.type === "low-money") {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("No tienes suficiente dinero para transferir.")
              .addFields({
                name: `Balance actual:`,
                value: `${result.balance.toLocaleString("es-AR")}`,
              })
              .setColor("Red"),
          ],
          flags: 1 << 6,
        });
      } else if (result.type === "same-user") {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("No puedes transferirte dinero a ti mismo.")
              .setColor("Red"),
          ],
          flags: 1 << 6,
        });
      }
    }
  },
};
