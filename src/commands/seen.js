const debug = require('debug');
const moment = require('moment');
const triggers = require('../util/triggers');
const config = require('../../config');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.development.url);
const Seen = sequelize.import('../models/seen');

const log = debug('Seen');

const message = msg => {
  const seenRegex = new RegExp(`^seen ${triggers.mentionRegex}$`, 'i');

  if (triggers.messageTriggered(msg, seenRegex)) {
    const user = msg.mentions[msg.mentions.length - 1];

    // untagged @mention, which Regex returns as a false positive
    if (user === undefined) {
      return false;
    }

    log(`Seen request for ${user}`);

    if (msg.client.users.get('id', user.id).status !== 'offline') {
      return "They're online right now!";
    }

    Seen.findOrCreate({
      where: {
        userId: user.id,
      },
      defaults: {
        lastSeen: 0,
      },
    }).spread((seen, created) => {
      let time = seen.lastSeen;

      if (created || seen.lastSeen === 0) {
        msg.client.sendMessage(msg.channel, `I don't have a record for ${user.username}`);
        return;
      }

      time = moment(seen.lastSeen * 1000);

      msg.client.sendMessage(msg.channel, `${user.username} last seen ${time.fromNow()}`);
      return;
    });
  }

  return false;
};

module.exports = {
  name: 'seen',
  help: '`@bot seen @user`. Displays the time since last user was online.',
  message,
};
