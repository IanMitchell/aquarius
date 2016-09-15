const debug = require('debug');
const Discord = require('discord.js');
const log = debug('Client');

// eslint-disable-next-line func-names
const Client = (function () {
  log('Creating Aquarius Client');
  return new Discord.Client();
}());

module.exports = Client;
