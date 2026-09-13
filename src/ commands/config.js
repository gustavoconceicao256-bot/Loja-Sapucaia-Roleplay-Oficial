
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const { isDeveloper } = require("../../utils/permissions");

const configPath = path.join(
  __dirname,
  "../../data/config.json"
);

function loadConfig() {
  delete require.cache[require.resolve("../../data/config.json")];
  return require("../../data/config.json");
}

function saveConfig(config) {
  fs.writeFileSync(
    configPath,
    JSON.stringify(config, null, 2),
    "utf8"
  );
}

const command = new SlashCommandBuilder()
  .setName("config")
  .setDescription("Abre o painel de configuração");

async function execute(interaction) {
  if (!isDeveloper(interaction.member)) {
    return interaction.reply({
      content:
        "❌ Você não possui o cargo necessário para usar este comando.",
      ephemeral: true
    });
  }

  const embed = new EmbedBuilder()
    .setTitle("⚙️ CONFIGURAÇÃO")
    .setDescription(
      "Configure o painel do **Sapucaia Roleplay** utilizando os botões abaixo."
    )
    .setColor(0xff0066)
    .addFields(
      {
        name: "🌐 Servidor",
        value: "Configure IP e porta do FiveM.",
        inline: false
      },
      {
        name: "🔗 Links",
        value: "Configure Conectar e Loja.",
        inline: false
      },
      {
        name: "🎨 Visual",
        value: "Configure nome, logo e banner.",
        inline: false
      },
      {
        name: "🔄 Restart",
        value: "Configure o horário do restart.",
        inline: false
      }
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("config_ip")
      .setLabel("IP")
      .setEmoji("🌐")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("config_loja")
      .setLabel("Loja")
      .setEmoji("🛒")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("config_conectar")
      .setLabel("Conectar")
      .setEmoji("🔗")
      .setStyle(ButtonStyle.Success)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("config_nome")
      .setLabel("Nome")
      .setEmoji("✏️")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("config_logo")
      .setLabel("Logo")
      .setEmoji("💠")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("config_banner")
      .setLabel("Banner")
      .setEmoji("🖼️")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("config_restart")
      .setLabel("Restart")
      .setEmoji("🔄")
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.reply({
    embeds: [embed],
    components: [row1, row2],
    ephemeral: true
  });
}

function createModal(id, title, label, placeholder, value = "") {
  const input = new TextInputBuilder()
    .setCustomId("value")
    .setLabel(label)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(placeholder)
    .setRequired(true);

  if (value) {
    input.setValue(value);
  }

  return new ModalBuilder()
    .setCustomId(id)
    .setTitle(title)
    .addComponents(
      new ActionRowBuilder().addComponents(input)
    );
}

async function handleButton(interaction) {
  if (!isDeveloper(interaction.member)) {
    return interaction.reply({
      content: "❌ Sem permissão.",
      ephemeral: true
    });
  }

  const config = loadConfig();

  switch (interaction.customId) {
    case "config_ip":
      return interaction.showModal(
        createModal(
          "modal_ip",
          "🌐 IP DO SERVIDOR",
          "IP e porta",
          "Ex: 127.0.0.1:30120",
          config.servidor.ip
        )
      );

    case "config_loja":
      return interaction.showModal(
        createModal(
          "modal_loja",
          "🛒 LOJA",
          "URL da loja",
          "https://sualoja.com",
          config.links.loja
        )
      );

    case "config_conectar":
      return interaction.showModal(
        createModal(
          "modal_conectar",
          "🔗 CONECTAR",
          "URL de conexão",
          "https://...",
          config.links.conectar
        )
      );

    case "config_nome":
      return interaction.showModal(
        createModal(
          "modal_nome",
          "✏️ NOME",
          "Nome do servidor",
          "Sapucaia Roleplay",
          config.servidor.nome
        )
      );

    case "config_logo":
      return interaction.showModal(
        createModal(
          "modal_logo",
          "💠 LOGO",
          "URL da logo",
          "https://...",
          config.servidor.logo
        )
      );

    case "config_banner":
      return interaction.showModal(
        createModal(
          "modal_banner",
          "🖼️ BANNER",
          "URL do banner",
          "https://...",
          config.servidor.banner
        )
      );

    case "config_restart":
      return interaction.showModal(
        createModal(
          "modal_restart",
          "🔄 RESTART",
          "Horário",
          "Ex: 18:00",
          config.servidor.restart
        )
      );
  }
}

async function handleModal(interaction) {
  if (!isDeveloper(interaction.member)) {
    return interaction.reply({
      content: "❌ Sem permissão.",
      ephemeral: true
    });
  }

  const value = interaction.fields
    .getTextInputValue("value")
    .trim();

  const config = loadConfig();

  switch (interaction.customId) {
    case "modal_ip":
      config.servidor.ip = value;
      break;

    case "modal_loja":
      config.links.loja = value;
      break;

    case "modal_conectar":
      config.links.conectar = value;
      break;

    case "modal_nome":
      config.servidor.nome = value;
      break;

    case "modal_logo":
      config.servidor.logo = value;
      break;

    case "modal_banner":
      config.servidor.banner = value;
      break;

    case "modal_restart":
      config.servidor.restart = value;
      break;
  }

  saveConfig(config);

  await interaction.reply({
    content: "✅ Configuração salva com sucesso!",
    ephemeral: true
  });
}

module.exports = {
  command,
  execute,
  handleButton,
  handleModal
};
