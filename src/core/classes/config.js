const debug = require('debug');
const callerId = require('caller-id');
const ServerSetting = require('./server-setting');
const DefaultKey = require('./default-key');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);
const Setting = sequelize.import('../../models/setting');

const log = debug('Config');

class Config {
  constructor() {
    this.defaults = new Map();
    this.servers = new Map();
  }

  addServer(serverId) {
    this.servers.set(serverId, new ServerSetting());
  }

  addKey(key, defaultValue, description) {
    const caller = callerId.getData().typeName;

    if (!this.defaults.has(caller)) {
      this.defaults.set(caller, new Map());
    }

    this.defaults.get(caller).set(key, new DefaultKey(defaultValue, description));
  }

  getDescription(key) {
    const caller = callerId.getData().typeName;
    return this.defaults.get(caller).get(key).description;
  }

  getPermission(serverId, command) {
    return this.servers.get(serverId).getCommand(command);
  }

  setPermission(serverId, command, permission) {
    this.servers.get(serverId).updateCommand(command, permission);
    this.update(serverId);
  }

  get(serverId, key) {
    const caller = callerId.getData().typeName;

    if (!this.servers.get(serverId).getValue(caller, key)) {
      return this.defaults.get(caller).get(key).value;
    }

    return this.servers.get(serverId).getValue(caller, key);
  }

  set(serverId, key, value) {
    const caller = callerId.getData().typeName;
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
