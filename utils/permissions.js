const settings = require("../configuração/settings.json");

function isDeveloper(member) {
  if (!member || !member.roles) {
    return false;
  }

  return member.roles.cache.has(settings.developerRoleId);
}

module.exports = {
  isDeveloper
};
