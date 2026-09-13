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

const ready = require("./events/ready");
const interactionCreate = require("./events/interactionCreate");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

// ================================
// REGISTRAR COMANDOS
// ================================

client.commands.set(
  configCommand.command.name,
  configCommand
);

client.commands.set(
  statusCommand.command.name,
  statusCommand
);

// ================================
// EVENTO READY
// ================================

client.once("ready", async () => {
  await ready(client);

  const rest = new REST({
    version: "10"
  }).setToken(process.env.DISCORD_TOKEN);

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

    console.log("✅ Comandos registrados com sucesso!");
  } catch (error) {
    console.error(
      "❌ Erro ao registrar comandos:",
      error
    );
  }
});

// ================================
// INTERAÇÕES
// ================================

client.on(
  "interactionCreate",
  async (interaction) => {
    await interactionCreate(interaction);
  }
);

// ================================
// LOGIN
// ================================

if (!process.env.DISCORD_TOKEN) {
  console.error(
    "❌ DISCORD_TOKEN não foi configurado no arquivo .env"
  );

  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
