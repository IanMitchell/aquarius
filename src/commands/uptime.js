const debug = require('debug');
const client = require('../client');

const log = debug('Uptime');

exports.messageTriggered = message => message === 'uptime';
exports.message = () => {
  log(`Uptime called: ${client.uptime}`);
  return client.uptime;
};

exports.helpTriggered = (message) => message.includes('uptime');
exports.help = () => 'Displays the bot uptime.';
