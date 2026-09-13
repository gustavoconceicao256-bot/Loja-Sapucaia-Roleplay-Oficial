const configCommand = require("../src/commands/config");

async function interactionCreate(interaction) {
  try {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(
        interaction.commandName
      );

      if (!command) return;

      await command.execute(interaction);
      return;
    }

    if (interaction.isButton()) {
      await configCommand.handleButton(interaction);
      return;
    }

    if (interaction.isModalSubmit()) {
      await configCommand.handleModal(interaction);
      return;
    }
  } catch (error) {
    console.error("❌ Erro na interação:", error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "❌ Ocorreu um erro ao executar esta ação.",
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: "❌ Ocorreu um erro ao executar esta ação.",
        ephemeral: true
      });
    }
  }
}

module.exports = interactionCreate;
