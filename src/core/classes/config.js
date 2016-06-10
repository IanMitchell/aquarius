const debug = require('debug');
const callerId = require('caller-id');
const ServerSetting = require('./server-setting');
const CommandKey = require('./command-key');

const log = debug('Config');

class Config {
  constructor() {
    this.commands = new Map();
    this.servers = new Map();
  }

  addServer(serverId) {
    this.servers.set(serverId, new ServerSetting());
  }

  addKey(key, defaultValue, description) {
    const caller = callerId.getData().typeName;

    if (!this.commands.has(caller)) {
      this.commands.set(caller, new Map());
    }

    this.commands.get(caller).set(key, new CommandKey(defaultValue, description));
  }

  getDescription(key) {
    const caller = callerId.getData().typeName;
    return this.commands.get(caller).get(key).description;
  }

  get(serverId, key) {
    const caller = callerId.getData().typeName;

    if (!this.servers.get(serverId).getValue(caller, key)) {
      return this.commands.get(caller).get(key).defaultValue;
    }

    return this.servers.get(serverId).getValue(caller, key);
  }

  set(serverId, key, value) {
    const caller = callerId.getData().typeName;
    this.servers.get(serverId).addValue(caller, key, value);
    this.update(serverId);
  }

  load() {
    // TODO: Load all SQL tables and deserialize

    // HACK: TEMPORARY
    this.addServer('91318657375825920');

    return;
  }

  update(serverId) {
    log(`Updating ${serverId} Config`);
    // TODO: Serialize serverid and save to db
    return serverId;
  }
}

module.exports = Config;
