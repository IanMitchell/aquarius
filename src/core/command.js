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
    return;
  }
}

module.exports = Command;
