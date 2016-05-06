const debug = require('debug');
const moment = require('moment');


const log = debug('Uptime');

const message = msg => {
  if (msg.cleanContent.toLowerCase() === '@aquarius uptime') {
    log(`Uptime called: ${msg.client.uptime}`);
    const uptime = moment(Date.now() - msg.client.uptime).fromNow(true);
    return `Aquarius has been up for ${uptime}`;
  }

  return false;
};

module.exports = {
  name: 'uptime',
  help: 'Uptime displays the bot uptime.',
  message,
};
