const debug = require('debug');
const stackTrace = require('stack-trace');
const GuildSetting = require('./guild-setting');
const DefaultKey = require('./default-key');
const Sequelize = require('../database/sequelize');
const Setting = Sequelize.import('../../models/setting');

const log = debug('Config');
// log.log = require('../../dashboard/log');

class Config {
  constructor() {
    this.defaults = new Map();
    this.guilds = new Map();
  }

  addGuild(guildId) {
    this.guilds.set(guildId, new GuildSetting());
    this.update(guildId);
  }

  addCommand(guildId, command) {
    if (!this.guilds.has(guildId)) {
      this.addGuild(guildId);
    }

    this.guilds.get(guildId).addCommand(command);
    this.update(guildId);
  }

  removeCommand(guildId, command) {
    if (!this.guilds.has(guildId)) {
      this.addGuild(guildId);
    }

    this.guilds.get(guildId).removeCommand(command);
    this.update(guildId);
  }

  clearCommands(guildId) {
    if (!this.guilds.has(guildId)) {
      this.addGuild(guildId);
    }

    this.guilds.get(guildId).clearCommands();
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

  getCommands(guildId) {
    if (!this.guilds.has(guildId)) {
      this.addGuild(guildId);
    }

    return this.guilds.get(guildId).getCommands();
  }

  getPermission(guildId, command) {
    if (!this.guilds.has(guildId)) {
      this.addGuild(guildId);
    }

    return this.guilds.get(guildId).getCommand(command);
  }

  setPermission(guildId, permission) {
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


    this.guilds.get(guildId).updateCommand(caller, level);
    this.update(guildId);
    return true;
  }

  getKeys() {
    const caller = stackTrace.get()[1].getTypeName();

    if (this.defaults.has(caller)) {
      return this.defaults.get(caller).keys();
    }

    return new Map().keys();
  }

  get(guildId, key) {
    const caller = stackTrace.get()[1].getTypeName();

    if (!this.guilds.has(guildId)) {
      this.addGuild(guildId);
    }


    if (!this.guilds.get(guildId).getValue(caller, key)) {
      return this.defaults.get(caller).get(key).value;
    }

    return this.guilds.get(guildId).getValue(caller, key);
  }

  set(guildId, key, value) {
    const caller = stackTrace.get()[1].getTypeName();

    if (!this.guilds.has(guildId)) {
      this.addguild(guildId);
    }

    this.guilds.get(guildId).addValue(caller, key, value);
    this.update(guildId);
  }

  load() {
    Setting.findAll().then(settings => {
      settings.forEach(setting => {
        this.addGuild(setting.guildId);
        this.guilds.get(setting.guildId).deserializeCommands(setting.commands);
        this.guilds.get(setting.guildId).deserializeSettings(setting.config);
      });
    });

    log('Configuration loaded');
  }

  update(guildId) {
    log(`Updating ${guildId} Config`);

    Setting.findOrCreate({
      where: {
        guildId,
      },
      defaults: {
        guildId,
        commands: this.guilds.get(guildId).serializeCommands(),
        config: this.guilds.get(guildId).serializeSettings(),
      },
    }).spread((setting, created) => {
      if (!created) {
        Setting.update({
          commands: this.guilds.get(guildId).serializeCommands(),
          config: this.guilds.get(guildId).serializeSettings(),
        }, {
          where: {
            guildId,
          },
        });
      }
    });
  }
}

module.exports = Config;
