const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("split")
    .setDescription("Calcula la división de botín entre jugadores")
    .addStringOption((option) =>
      option
        .setName("motivo")
        .setDescription("Motivo de la división")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("cantidad")
        .setDescription("Cantidad total del botín")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("jugadores")
        .setDescription("Número de jugadores a dividir")
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(50)
    )
    .addNumberOption((option) =>
      option
        .setName("tasa")
        .setDescription("Tasa o impuesto (ejemplo: 20 para 20%)")
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(100)
    ),
  async execute(interaction) {
    const motivo = interaction.options.getString("motivo");
    const cantidad = interaction.options.getInteger("cantidad");
    const jugadores = interaction.options.getInteger("jugadores");
    const tasa = interaction.options.getNumber("tasa") || 0;

    // Calcular el impuesto
    const impuesto = cantidad * (tasa / 100);
    const cantidadDespuesImpuesto = cantidad - impuesto;
    const cantidadPorJugador = Math.floor(cantidadDespuesImpuesto / jugadores);

    // Calcular el residuo por redondeo
    const residuo = cantidadDespuesImpuesto - cantidadPorJugador * jugadores;

    const embed = new EmbedBuilder()
      .setTitle(`🪙 ${motivo}`)
      .setColor("#FFD700")
      .addFields(
        {
          name: "💰 Cantidad Total",
          value: `${cantidad.toLocaleString()} plata`,
          inline: true,
        },
        { name: "👥 Jugadores", value: jugadores.toString(), inline: true },
        { name: "📊 Tasa", value: `${tasa}%`, inline: true },
        {
          name: "💸 Impuesto Total",
          value: `${impuesto.toLocaleString()} plata`,
          inline: true,
        },
        {
          name: "🎯 Por Jugador",
          value: `${cantidadPorJugador.toLocaleString()} plata`,
          inline: true,
        },
        {
          name: "✨ Residuo",
          value: `${residuo.toLocaleString()} plata`,
          inline: true,
        }
      )
      .setFooter({ text: "Chuny Balance BOT" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
