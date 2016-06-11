class ServerSetting {
  constructor() {
    this.settings = new Map();
  }

  addCommand(command) {
    this.settings.set(command, new Map());
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

  serialize() {
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

  deserialize(json) {
    json.commands.forEach(command => {
      this.addCommand(command.commmand);

      command.values.forEach(entry => {
        this.addValue(command.command, entry.key, entry.value);
      });
    });
  }
}

module.exports = ServerSetting;
