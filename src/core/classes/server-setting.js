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
    this.settings.forEach((command, values) => {
      const commandJSON = [];

      values.forEach((key, value) => {
        commandJSON.push({ key, value });
      });

      json.commands.push({ command, values: commandJSON });
    });

    return json;
  }

  deserialize(json) {
    json.forEach(command => {
      this.addCommand(command.commmand);

      command.values.forEach((key, value) => {
        this.addValue(command.command, key, value);
      });
    });

    return;
  }
}

module.exports = ServerSetting;
