const debug = require('debug');
const settings = require('../settings/settings');

class Command {
  constructor() {
    this.name = this.constructor.name;
    this.log = debug(this.name);
    this.settings = settings;
  }

  isAvailable(guildId) {
    return true;
  }

  addGuild(guildId) {
    return;
  }

  message(message) {
    return;
  }

  helpMessage(nickname) {
    let msg = `**${this.name}**\n`;
    msg += `${this.description}\n\n`;
    return msg;
  }

  getKeys() {
    return this.settings.getKeys();
  }

  setSetting(guildId, key, value) {
    this.settings.set(guildId, key, value);
  }

  setPermission(guildId, permission) {
    return this.settings.setPermission(guildId, permission);
  }

  getSettingDescription(key) {
    return this.settings.getDescription(key);
  }

  getSetting(guild, key) {
    return this.settings.get(guild, key);
  }

  getSettingDefault(key) {
    return this.settings.getDefault(key);
  }
}

module.exports = Command;
