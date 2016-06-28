const debug = require('debug');
const log = debug('Settings');
const Config = require('./classes/config');


const Settings = (function () {
  log('Creating Settings');

  const config = new Config();
  config.load();

  return config;
}());

module.exports = Settings;
