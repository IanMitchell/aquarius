const debug = require('debug');
const log = debug('Settings');
const Config = require('./classes/config');


const Settings = (function () {
  log('Creating Settings');

  const config = new Config();
  config.load();

  config.addServer('91318657375825920');

  return config;
}());

module.exports = Settings;
