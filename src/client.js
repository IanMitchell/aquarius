const debug = require('debug');
const Discord = require('discord.js');
const log = debug('Client');

const Client = (function () {
  log('Creating Aquarius Client');
  return new Discord.Client();
}());

module.exports = Client;
