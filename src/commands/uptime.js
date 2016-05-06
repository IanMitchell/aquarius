const debug = require('debug');
const moment = require('moment');


const log = debug('Uptime');

const triggered = msg => msg.cleanContent.toLowerCase() === '@aquarius uptime';
const message = msg => {
  log(`Uptime called: ${msg.client.uptime}`);
  const uptime = moment(Date.now() - msg.client.uptime).fromNow(true);
  return `Aquarius has been up for ${uptime}`;
};

module.exports = {
  name: 'uptime',
  help: 'Uptime displays the bot uptime.',
  triggered,
  message,
};
