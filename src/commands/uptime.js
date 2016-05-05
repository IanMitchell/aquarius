const debug = require('debug');
const client = require('../client');
const moment = require('moment');


const log = debug('Uptime');

exports.messageTriggered = message => message === 'uptime';
exports.message = () => {
  log(`Uptime called: ${client.uptime}`);
  const uptime = moment(Date.now() - client.uptime).fromNow(true);
  return `Aquarius has been up for ${uptime}`;
};

exports.helpTriggered = (message) => message.includes('uptime');
exports.help = () => 'Displays the bot uptime.';
