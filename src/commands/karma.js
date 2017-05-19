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

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += '```[@user]++ [optional message]\n';
    msg += `@${nickname} karma leaderboard\n`;
    msg += `@${nickname} karma [@user]\`\`\``;
    msg += 'Example:\n';
    msg += `\`\`\`@${nickname}++ thanks for being awesome!\n\`\`\``;
    return msg;
  }

  getCooldown(guild) {
    let val = parseInt(this.getSetting(guild, 'cooldown'), 10);

    if (isNaN(val)) {
      val = DEFAULT_COOLDOWN;
    }

    val = Math.max(10, val);

    return val;
  }

  message(msg) {
    const karmaName = this.getSetting(msg.guild.id, 'name');

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
          guildId: msg.guild.id,
        },
        order: [
          [Aquarius.Sequelize.col('count'), 'DESC'],
        ],
        limit: 5,
      }).then(response => {
        if (response.length === 0) {
          msg.channel.send('There is no leaderboard for this server!');
        } else {
          let str = `**${karmaName} Leaderboard**\n`;

          const nicks = [];

          response.forEach((record, index) => {
            nicks.push(Aquarius.Users.getNickname(msg.guild, record.userId).then(nick => {
              const entry = {
                index,
                nick,
                karma: record.count,
              };

              return entry;
            }));
          });

          Promise.all(nicks).then(entries => {
            entries.forEach(entry => {
              str += `${entry.index + 1}. ${entry.nick} - ${entry.karma} ${karmaName}\n`;
            });
          }).then(() => msg.channel.send(str));
        }
      });

      return;
    }

    if (Aquarius.Triggers.messageTriggered(msg, karmaLookupRegex)) {
      const user = msg.mentions.users.first();

      if (user === undefined) {
        return;
      }

      this.log(`Request for ${user.username}'s Karma'`);

      Karma.findOrCreate({
        where: {
          userId: user.id,
          guildId: msg.guild.id,
        },
        defaults: {
          count: 0,
          totalGiven: 0,
          lastGiven: 0,
        },
      }).spread((karma) => {
        Aquarius.Users.getNickname(msg.guild, user.id).then(nick => {
          msg.channel.send(`${nick} has ${karma.count} ${karmaName}.`);
        });
      });

      return;
    }

    const karmaInput = Aquarius.Triggers.customTrigger(msg, karmaRegex);

    if (karmaInput) {
      const user = msg.mentions.users.first();

      // untagged @mention, which Regex returns as a false positive
      if (user === undefined) {
        return;
      }

      this.log(`Karma request for ${user}`);

      if (user === msg.author && !Aquarius.Permissions.isBotOwner(user)) {
        msg.channel.send(`You cannot give ${karmaName} to yourself!`);
        return;
      }

      Karma.findOrCreate({
        where: {
          userId: msg.author.id,
          guildId: msg.guild.id,
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

        const cooldown = this.getCooldown(msg.guild.id);

        if (cooldown > moment().unix() - karmaGiver.lastGiven) {
          this.log('Karma cooldown');
          const future = moment((karmaGiver.lastGiven + cooldown) * 1000);
          const wait = future.toNow(true);
          msg.channel.send(`You need to wait ${wait} to use ${karmaName}!`);
          return false;
        }

        return Karma.findOrCreate({
          where: {
            userId: user.id,
            guildId: msg.guild.id,
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

            const nick = Aquarius.Users.getNickname(msg.guild, user).then(nickname => {
              str += `${nickname} now has ${result.count} ${karmaName}.`;
            });

            return Promise.all([nick]).then(() => msg.channel.send(str));
          });
        });
      });

      return;
    }

    return;
  }
}

module.exports = new KarmaCommand();
