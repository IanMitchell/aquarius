const debug = require('debug');
const callerId = require('caller-id');
const ServerSetting = require('./server-setting');
const CommandKey = require('./command-key');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);
const Setting = sequelize.import('../../models/setting');

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
    Setting.findAll().then(settings => {
      settings.forEach(setting => {
        this.addServer(setting.serverId);
        this.servers.get(setting.serverId).deserialize(setting.config);
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
        config: this.servers.get(serverId).serialize(),
      },
    }).spread((setting, created) => {
      if (!created) {
        Setting.update({
          config: this.servers.get(serverId).serialize(),
        }, {
          serverId,
        });
      }
    });
  }
}

module.exports = Config;
