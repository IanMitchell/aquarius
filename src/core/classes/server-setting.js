class ServerSetting {
  constructor() {
    this.settings = new Map();
    this.commands = new Map();
  }

  addCommand(command, permission = 0) {
    if (this.commands.has(command)) {
      return this.commands.set(command, permission);
    }

    if (!this.settings.has(command)) {
      this.settings.set(command, new Map());
    }

    return false;
  }

  updateCommand(command, permission) {
    return this.commands.set(command, permission);
  }

  removeCommand(command) {
    return this.commands.delete(command);
  }

  getCommand(command) {
    return this.commands.get(command);
  }

  addValue(command, key, value) {
    if (!this.settings.has(command)) {
      this.addCommand(command);
    }

    this.settings.get(command).set(key, value);
  }

  getValue(command, key) {
    if (this.settings.has(command)) {
      return this.settings.get(command).get(key);
    }

    return false;
  }

  serializeCommands() {
    const json = {};

    json.commands = [];
    this.commands.forEach((value, key) => {
      json.commands.push({ key, value });
    });

    return json;
  }

  deserializeCommands(json) {
    json.commands.forEach(command => {
      this.addCommand(command.key, command.value);
    });
  }

  serializeSettings() {
    const json = {};

    json.commands = [];
    this.settings.forEach((values, command) => {
      const commandJSON = [];

      values.forEach((value, key) => {
        commandJSON.push({ key, value });
      });

      json.commands.push({ command, values: commandJSON });
    });

    return json;
  }

  deserializeSettings(json) {
    json.commands.forEach(command => {
      this.addCommand(command.commmand);

      command.values.forEach(entry => {
        this.addValue(command.command, entry.key, entry.value);
      });
    });
  }
}

module.exports = ServerSetting;
