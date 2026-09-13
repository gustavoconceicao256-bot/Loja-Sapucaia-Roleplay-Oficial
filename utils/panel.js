
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../data/config.json");
const settings = require("../config/settings.json");
const { getFiveMStatus } = require("../events/services/fivem");

function loadConfig() {
  delete require.cache[require.resolve("../data/config.json")];
  return require("../data/config.json");
}

function getRestartCountdown(horario) {
  if (!horario || !horario.includes(":")) {
    return "Não configurado";
  }

  const [hora, minuto] = horario.split(":").map(Number);

  const agora = new Date();
  const proximo = new Date(agora);

  proximo.setHours(hora, minuto, 0, 0);

  if (proximo <= agora) {
    proximo.setDate(proximo.getDate() + 1);
  }

  const diferenca = proximo - agora;

  const horas = Math.floor(diferenca / 3600000);
  const minutos = Math.floor((diferenca % 3600000) / 60000);
  const segundos = Math.floor((diferenca % 60000) / 1000);

  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
}

async function createPanel() {
  const config = loadConfig();
  const status = await getFiveMStatus();

  const onlineEmoji = settings.status.onlineEmoji;
  const offlineEmoji = settings.status.offlineEmoji;

  const embed = new EmbedBuilder()
    .setTitle(`🔥 ${config.servidor.nome}`)
    .setColor(
      status.online
        ? parseInt(settings.embed.color.replace("#", ""), 16)
        : 0x2b2d31
    )
    .setDescription(
      status.online
        ? `${onlineEmoji} **SERVIDOR ONLINE**`
        : `${offlineEmoji} **SERVIDOR OFFLINE**`
    )
    .addFields(
      {
        name: "👥 JOGADORES",
        value: `**${status.players}/${status.maxPlayers}**`,
        inline: true
      },
      {
        name: "🔄 PRÓXIMO RESTART",
        value: `**${getRestartCountdown(config.servidor.restart)}**`,
        inline: true
      }
    )
    .setFooter({
      text: settings.embed.footer
    })
    .setTimestamp();

  if (config.servidor.logo) {
    embed.setThumbnail(config.servidor.logo);
  }

  if (config.servidor.banner) {
    embed.setImage(config.servidor.banner);
  }

  const botoes = [];

  if (config.links.conectar) {
    botoes.push(
      new ButtonBuilder()
        .setLabel("CONECTAR")
        .setEmoji("🔗")
        .setStyle(ButtonStyle.Link)
        .setURL(config.links.conectar)
    );
  }

  if (config.links.loja) {
    botoes.push(
      new ButtonBuilder()
        .setLabel("LOJA")
        .setEmoji("🛒")
        .setStyle(ButtonStyle.Link)
        .setURL(config.links.loja)
    );
  }

  const components = [];

  if (botoes.length > 0) {
    components.push(
      new ActionRowBuilder().addComponents(botoes)
    );
  }

  return {
    embeds: [embed],
    components
  };
}

async function updatePanel(client) {
  const config = loadConfig();

  if (!config.painel.channelId || !config.painel.messageId) {
    return;
  }

  try {
    const channel = await client.channels.fetch(
      config.painel.channelId
    );

    if (!channel) return;

    const message = await channel.messages.fetch(
      config.painel.messageId
    );

    const panel = await createPanel();

    await message.edit(panel);
  } catch (error) {
    console.log("⚠️ Não foi possível atualizar o painel.");
  }
}

function savePanelLocation(channelId, messageId) {
  const config = loadConfig();

  config.painel.channelId = channelId;
  config.painel.messageId = messageId;

  fs.writeFileSync(
    configPath,
    JSON.stringify(config, null, 2),
    "utf8"
  );
}

module.exports = {
  createPanel,
  updatePanel,
  savePanelLocation
};
