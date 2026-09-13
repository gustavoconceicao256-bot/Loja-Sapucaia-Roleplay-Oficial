const {
  ActivityType
} = require("discord.js");

const {
  updatePanel
} = require("../utils/panel");

const settings = require("../config/settings.json");

async function ready(client) {
  console.log("================================");
  console.log(`🤖 Bot: ${client.user.tag}`);
  console.log(`🟢 Status: ONLINE`);
  console.log("================================");

  client.user.setPresence({
    activities: [
      {
        name: "Sapucaia Roleplay",
        type: ActivityType.Playing
      }
    ],
    status: "online"
  });

  await updatePanel(client);

  setInterval(() => {
    updatePanel(client);
  }, settings.updateInterval);

  console.log(
    `🔄 Painel configurado para atualizar a cada ${settings.updateInterval / 1000}s.`
  );
}

module.exports = ready;
