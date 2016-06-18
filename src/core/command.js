const debug = require('debug');
const client = require('./client');
const settings = require('./settings');

class Command {
  constructor() {
    this.name = this.constructor.name;
    this.log = debug(this.name);
    this.client = client;
    this.settings = settings;
  }

  isAvailable(serverId) {
    return true;
  }

  addServer(serverId) {
    return;
  }

  message(message) {
    return;
  }

  helpMessage(serverId) {
    let msg = `**${this.name}**\n`;
    msg += `${this.description}\n\n`;
    msg += 'Usage:\n';
    msg += `${this.usage}`;
    return msg;
  }

  getKeys() {
    return this.settings.getKeys();
  }

  setSetting(serverId, key, value) {
    this.settings.set(serverId, key, value);
  }

  getSettingDescription(key) {
    return this.settings.getDescription(key);
  }

  getSetting(server, key) {
    return this.settings.get(server, key);
  }

  getSettingDefault(key) {
    return this.settings.getDefault(key);
  }
}

module.exports = Command;
