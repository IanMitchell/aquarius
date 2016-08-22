const debug = require('debug');
const client = require('./client');
const settings = require('./settings');

class Command {
  constructor() {
    this.name = this.constructor.name;
    this.log = debug(this.name);
    this.log.log = require('../dashboard/log');
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

  helpMessage(server) {
    let msg = `**${this.name}**\n`;
    msg += `${this.description}\n\n`;
    return msg;
  }

  getKeys() {
    return this.settings.getKeys();
  }

  setSetting(serverId, key, value) {
    this.settings.set(serverId, key, value);
  }

  setPermission(serverId, permission) {
    return this.settings.setPermission(serverId, permission);
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
