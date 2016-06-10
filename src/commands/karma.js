const debug = require('debug');
const moment = require('moment');
const settings = require('../core/settings');
const triggers = require('../util/triggers');
const users = require('../util/users');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);
const Karma = sequelize.import('../models/karma');

const log = debug('Karma');

const KARMA_COOLDOWN = 5 * 60; // 1m (Unix Timestamp, so in seconds not ms)

let helpMessage = '`@name [plus|minus] karma`. Modifies the users karma (+/- 1pt).\n';
helpMessage += '`@bot karma leaderboard`. Displays the karma leaderboards.';

settings.addKey('name', 'Karma', 'Alias for Karma');
settings.set('91318657375825920', 'name', 'Tinfoil Hats');

const message = msg => {
  if (triggers.messageTriggered(msg, /^karma leaderboard$/)) {
    log('Server leaderboard requested');
    Karma.findAll({
      where: {
        serverId: msg.channel.server.id,
      },
      order: [
        [sequelize.col('count'), 'DESC'],
      ],
      limit: 5,
    }).then(response => {
      if (response.length === 0) {
        msg.client.sendMessage(msg.channel, 'There is no leaderboard for this server!');
      } else {
        let str = `**${settings.get(msg.channel.server.id, 'name')} Leaderboard**\n`;

        response.forEach((record, index) => {
          const nick = users.getNickname(msg.channel.server, record.userId);
          str += `${index + 1}. ${nick} - ${record.count} Karma\n`;
        });

        msg.client.sendMessage(msg.channel, str);
      }
    });

    return false;
  }

  const karmaLookupRegex = new RegExp(`^karma ${triggers.mentionRegex}$`, 'i');
  if (triggers.messageTriggered(msg, karmaLookupRegex)) {
    const user = msg.mentions[msg.mentions.length - 1];
    log(`Request for ${user.name}'s Karma'`);

    Karma.findOne({
      where: {
        userId: user.id,
        serverId: msg.channel.server.id,
      },
    }).then(karma => {
      const nick = users.getNickname(msg.channel.server, user.id);
      msg.client.sendMessage(msg.channel, `${nick} has ${karma.count} Karma.`);
    });

    return false;
  }

  const karmaRegex = new RegExp([
    `^${triggers.mentionRegex}(?:(?: (?:(plus|minus) karma).*)|`,
    '(?: ?((\\+\\+).*|(--).*)))$',
  ].join(''), 'i');
  const karmaInput = triggers.customTrigger(msg, karmaRegex);

  if (karmaInput) {
    const user = msg.mentions[0];

    // untagged @mention, which Regex returns as a false positive
    if (user === undefined) {
      return false;
    }

    log(`Karma request for ${user}`);

    if (user === msg.author) {
      msg.client.sendMessage(msg.channel, 'You cannot give karma to yourself!');
      return false;
    }

    Karma.findOrCreate({
      where: {
        userId: msg.author.id,
        serverId: msg.channel.server.id,
      },
      defaults: {
        count: 0,
        totalGiven: 0,
        lastGiven: 0,
      },
    }).spread((karmaGiver, created) => {
      if (created) {
        log('Karma record created');
      }

      if (KARMA_COOLDOWN > moment().unix() - karmaGiver.lastGiven) {
        log('Karma cooldown');
        const future = moment((karmaGiver.lastGiven + KARMA_COOLDOWN) * 1000);
        const wait = future.toNow(true);
        msg.client.sendMessage(msg.channel, `You need to wait ${wait} to use karma!`);
        return false;
      }

      return Karma.findOrCreate({
        where: {
          userId: user.id,
          serverId: msg.channel.server.id,
        },
        defaults: {
          count: 0,
          totalGiven: 0,
          lastGiven: 0,
        },
      }).spread((karma, newRecord) => {
        if (newRecord) {
          log('Karma record created');
        }

        if (karmaInput[1] === 'plus' || karmaInput[3] === '++') {
          log('increasing karma');
          return karma.increment('count', { by: 1 });
        }

        log('Decreasing karma');
        return karma.decrement('count', { by: 1 });
      }).then(result => {
        karmaGiver.update({
          lastGiven: moment().unix(),
          totalGiven: karmaGiver.totalGiven + 1,
        }).then(() => {
          let str = 'Karma ';
          if (karmaInput[1] === 'plus' || karmaInput[3] === '++') {
            str += 'given! ';
          } else {
            str += 'removed! ';
          }

          str += `${user} now has ${result.count} karma.`;
          return msg.client.sendMessage(msg.channel, str);
        });
      });
    });

    return false;
  }

  return false;
};

module.exports = {
  name: 'karma',
  help: helpMessage,
  message,
};
