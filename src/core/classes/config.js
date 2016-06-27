const debug = require('debug');
const ServerSetting = require('./server-setting');
const DefaultKey = require('./default-key');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);
const Setting = sequelize.import('../../models/setting');
const stackTrace = require('stack-trace');

const log = debug('Config');

class Config {
  constructor() {
    this.defaults = new Map();
    this.servers = new Map();
  }

  addServer(serverId) {
    this.servers.set(serverId, new ServerSetting());
  }

  addCommand(serverId, command) {
    if (!this.servers.has(serverId)) {
      this.addServer(serverId);
    }

    this.servers.get(serverId).addCommand(command);
    this.update(serverId);
  }

  removeCommand(serverId, command) {
    if (!this.servers.has(serverId)) {
      this.addServer(serverId);
    }

    this.servers.get(serverId).removeCommand(command);
    this.update(serverId);
  }

  clearCommands(serverId) {
    if (!this.servers.has(serverId)) {
      this.addServer(serverId);
    }

    this.servers.get(serverId).clearCommands();
  }

  addKey(key, defaultValue, description) {
    const caller = stackTrace.get()[1].getTypeName();

    if (!this.defaults.has(caller)) {
      this.defaults.set(caller, new Map());
    }

    this.defaults.get(caller).set(key, new DefaultKey(defaultValue, description));
  }

  getDescription(key) {
    const caller = stackTrace.get()[1].getTypeName();
    return this.defaults.get(caller).get(key).description;
  }

  getDefault(key) {
    const caller = stackTrace.get()[1].getTypeName();
    return this.defaults.get(caller).get(key).value;
  }

  getCommands(serverId) {
    if (!this.servers.has(serverId)) {
      this.addServer(serverId);
    }

    return this.servers.get(serverId).getCommands();
  }

  getPermission(serverId, command) {
    if (!this.servers.has(serverId)) {
      this.addServer(serverId);
    }

    return this.servers.get(serverId).getCommand(command);
  }

  setPermission(serverId, permission) {
    const caller = stackTrace.get()[1].getTypeName();

    let level = permission;

    switch (permission.toLowerCase()) {
      case 'admin':
        level = 2;
        break;
      case 'restricted':
        level = 1;
        break;
      case 'all':
        level = 0;
        break;
      default:
        return false;
    }


    this.servers.get(serverId).updateCommand(caller, level);
    this.update(serverId);
    return true;
  }

  getKeys() {
    const caller = stackTrace.get()[1].getTypeName();

    if (this.defaults.has(caller)) {
      return this.defaults.get(caller).keys();
    }

    return new Map().keys();
  }

  get(serverId, key) {
    const caller = stackTrace.get()[1].getTypeName();

    if (!this.servers.has(serverId)) {
      this.addServer(serverId);
    }


    if (!this.servers.get(serverId).getValue(caller, key)) {
      return this.defaults.get(caller).get(key).value;
    }

    return this.servers.get(serverId).getValue(caller, key);
  }

  set(serverId, key, value) {
    const caller = stackTrace.get()[1].getTypeName();

    if (!this.servers.has(serverId)) {
      this.addServer(serverId);
    }

    this.servers.get(serverId).addValue(caller, key, value);
    this.update(serverId);
  }

  load() {
    Setting.findAll().then(settings => {
      settings.forEach(setting => {
        this.addServer(setting.serverId);
        this.servers.get(setting.serverId).deserializeCommands(setting.commands);
        this.servers.get(setting.serverId).deserializeSettings(setting.config);
      });
    });

    log('Configuration loaded');
  }

  update(serverId) {
    log(`Updating ${serverId} Config`);

    Setting.findOrCreate({
      where: {
        serverId,
      },
      defaults: {
        serverId,
        commands: this.servers.get(serverId).serializeCommands(),
        config: this.servers.get(serverId).serializeSettings(),
      },
    }).spread((setting, created) => {
      if (!created) {
        Setting.update({
          commands: this.servers.get(serverId).serializeCommands(),
          config: this.servers.get(serverId).serializeSettings(),
        }, {
          where: {
            serverId,
          },
        });
      }
    });
  }
}

module.exports = Config;
