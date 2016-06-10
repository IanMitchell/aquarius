class Command {
  constructor() {
    this.name = 'Command';
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
