const debug = require('debug');
const Config = require('./config');
const log = debug('Settings');
// log.log = require('../dashboard/log');

// eslint-disable-next-line func-names
const Settings = (function () {
  log('Creating Settings');

  const config = new Config();
  config.load();

  return config;
}());

module.exports = Settings;
