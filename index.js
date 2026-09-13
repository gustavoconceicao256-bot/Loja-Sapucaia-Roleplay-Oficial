
require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes
} = require("discord.js");

const configCommand = require("./src/commands/config");
const statusCommand = require("./src/commands/status");

const {
  updatePanel
} = require("./utils/panel");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

client.commands.set(
  configCommand.command.name,
  configCommand
);

client.commands.set(
  statusCommand.command.name,
  statusCommand
);

client.once("ready", async () => {
  console.log(`🤖 ${client.user.tag} conectado!`);

  const rest = new REST({
    version: "10"
  }).setToken(
    process.env.DISCORD_TOKEN
  );

  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      {
        body: [
          configCommand.command.toJSON(),
          statusCommand.command.toJSON()
        ]
      }
    );

    console.log("✅ Comandos registrados.");
  } catch (error) {
    console.error(
      "❌ Erro ao registrar comandos:",
      error
    );
  }

  await updatePanel(client);

  setInterval(
    () => updatePanel(client),
    30000
  );

  console.log(
    "🔄 Atualização automática ativada: 30 segundos."
  );
});

client.on(
  "interactionCreate",
  async interaction => {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(
          interaction.commandName
        );

        if (!command) return;

        await command.execute(interaction);
        return;
      }

      if (interaction.isButton()) {
        await configCommand.handleButton(
          interaction
        );
        return;
      }

      if (interaction.isModalSubmit()) {
        await configCommand.handleModal(
          interaction
        );

        await updatePanel(client);
        return;
      }
    } catch (error) {
      console.error(error);

      if (
        !interaction.replied &&
        !interaction.deferred
      ) {
        await interaction.reply({
          content:
            "❌ Ocorreu um erro ao executar esta ação.",
          ephemeral: true
        });
      }
    }
  }
);

client.login(
  process.env.DISCORD_TOKEN
);
