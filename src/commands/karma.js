const Aquarius = require('../aquarius');
const moment = require('moment');
const Karma = Aquarius.Sequelize.import('../models/karma');

const DEFAULT_COOLDOWN = 5 * 60; // 5m (Unix Timestamp, so in seconds not ms)

class KarmaCommand extends Aquarius.Command {
  constructor() {
    super();
    this.name = 'Karma';
    this.description = 'Keeps track of Karma for users in your server';

    this.settings.addKey('name', 'Karma', 'What to call Karma on your server');
    this.settings.addKey('cooldown',
                    DEFAULT_COOLDOWN,
                    'Duration in seconds before a user can give karma again (Min: 10s)');
  }

  helpMessage(server) {
    let msg = super.helpMessage();
    const nickname = Aquarius.Users.getNickname(server, this.client.user);

    msg += 'Usage:\n';
    msg += '```@username++ [optional message]\n';
    msg += `@${nickname} karma leaderboard\n`;
    msg += `@${nickname} karma @user\`\`\``;
    msg += 'Example:\n';
    msg += `\`\`\`@${nickname}++ thanks for being awesome!\n\`\`\``;
    return msg;
  }

  getCooldown(server) {
    let val = parseInt(this.getSetting(server, 'cooldown'), 10);

    if (isNaN(val)) {
      val = DEFAULT_COOLDOWN;
    }

    val = Math.max(10, val);

    return val;
  }

  message(msg) {
    const karmaName = this.getSetting(msg.server.id, 'name');

    const leaderboardRegex = new RegExp(`^(?:karma|${karmaName}) leaderboard$`, 'i');
    const karmaLookupRegex = new RegExp(`^(?:karma|${karmaName}) ${Aquarius.Triggers.mentionRegex}$`, 'i');
    const karmaRegex = new RegExp([
      `^${Aquarius.Triggers.mentionRegex}(?:(?: (?:(plus|minus) (?:karma|${karmaName})).*)|`,
      '(?: ?((\\+\\+).*|(--).*)))$',
    ].join(''), 'i');

    if (Aquarius.Triggers.messageTriggered(msg, leaderboardRegex)) {
      this.log('Server leaderboard requested');
      Karma.findAll({
        where: {
          serverId: msg.server.id,
        },
        order: [
          [Aquarius.Sequelize.col('count'), 'DESC'],
        ],
        limit: 5,
      }).then(response => {
        if (response.length === 0) {
          msg.client.sendMessage(msg.channel, 'There is no leaderboard for this server!');
        } else {
          let str = `**${karmaName} Leaderboard**\n`;

          response.forEach((record, index) => {
            const nick = Aquarius.Users.getNickname(msg.server, record.userId);
            str += `${index + 1}. ${nick} - ${record.count} ${karmaName}\n`;
          });

          msg.client.sendMessage(msg.channel, str);
        }
      });

      return false;
    }

    if (Aquarius.Triggers.messageTriggered(msg, karmaLookupRegex)) {
      const user = msg.mentions[msg.mentions.length - 1];

      if (user === undefined) {
        return false;
      }

      this.log(`Request for ${user.name}'s Karma'`);

      Karma.findOrCreate({
        where: {
          userId: user.id,
          serverId: msg.server.id,
        },
        defaults: {
          count: 0,
          totalGiven: 0,
          lastGiven: 0,
        },
      }).spread((karma) => {
        const nick = Aquarius.Users.getNickname(msg.server, user.id);
        msg.client.sendMessage(msg.channel, `${nick} has ${karma.count} ${karmaName}.`);
      });

      return false;
    }

    const karmaInput = Aquarius.Triggers.customTrigger(msg, karmaRegex);

    if (karmaInput) {
      const user = msg.mentions[0];

      // untagged @mention, which Regex returns as a false positive
      if (user === undefined) {
        return false;
      }

      this.log(`Karma request for ${user}`);

      if (user === msg.author) {
        msg.client.sendMessage(msg.channel, `You cannot give ${karmaName} to yourself!`);
        return false;
      }

      Karma.findOrCreate({
        where: {
          userId: msg.author.id,
          serverId: msg.server.id,
        },
        defaults: {
          count: 0,
          totalGiven: 0,
          lastGiven: 0,
        },
      }).spread((karmaGiver, created) => {
        if (created) {
          this.log('Karma record created');
        }

        const cooldown = this.getCooldown(msg.server.id);

        if (cooldown > moment().unix() - karmaGiver.lastGiven) {
          this.log('Karma cooldown');
          const future = moment((karmaGiver.lastGiven + cooldown) * 1000);
          const wait = future.toNow(true);
          msg.client.sendMessage(msg.channel, `You need to wait ${wait} to use ${karmaName}!`);
          return false;
        }

        return Karma.findOrCreate({
          where: {
            userId: user.id,
            serverId: msg.server.id,
          },
          defaults: {
            count: 0,
            totalGiven: 0,
            lastGiven: 0,
          },
        }).spread((karma, newRecord) => {
          if (newRecord) {
            this.log('Karma record created');
          }

          if (karmaInput[1] === 'plus' || karmaInput[3] === '++') {
            this.log('increasing karma');
            return karma.increment('count', { by: 1 });
          }

          this.log('Decreasing karma');
          return karma.decrement('count', { by: 1 });
        }).then(result => {
          karmaGiver.update({
            lastGiven: moment().unix(),
            totalGiven: karmaGiver.totalGiven + 1,
          }).then(() => {
            let str = `${karmaName} `;
            if (karmaInput[1] === 'plus' || karmaInput[3] === '++') {
              str += 'given! ';
            } else {
              str += 'removed! ';
            }

            str += `${Aquarius.Users.getNickname(msg.server, user)} now has ${result.count} ${karmaName}.`;
            return msg.client.sendMessage(msg.channel, str);
          });
        });
      });

      return false;
    }

    return false;
  }
}

module.exports = new KarmaCommand();
