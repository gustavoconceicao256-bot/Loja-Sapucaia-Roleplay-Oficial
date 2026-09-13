const {
  SlashCommandBuilder
} = require("discord.js");

const {
  createPanel,
  savePanelLocation
} = require("../../utils/panel");

const command = new SlashCommandBuilder()
  .setName("status")
  .setDescription("Cria o painel de status do servidor");

async function execute(interaction) {
  await interaction.deferReply({
    ephemeral: true
  });

  const panel = await createPanel();

  const message = await interaction.channel.send(panel);

  savePanelLocation(
    interaction.channel.id,
    message.id
  );

  await interaction.editReply(
    "✅ Painel de status criado com sucesso!"
  );
}

module.exports = {
  command,
  execute
};
