const Aquarius = require('../aquarius');
const moment = require('moment');
const Seen = Aquarius.Sequelize.import('../models/seen');

class SeenCommand extends Aquarius.Command {
  constructor() {
    super();
    this.name = 'Seen';

    this.description = 'Tracks when a user was last seen online';

    Aquarius.Client.on('presenceUpdate', (oldUser, newUser) => {
      if (newUser.status === 'offline') {
        Seen.findOrCreate({
          where: {
            userId: newUser.id,
          },
          defaults: {
            lastSeen: moment().unix(),
          },
        }).spread((user, created) => {
          if (!created) {
            user.update({ lastSeen: moment().unix() });
          }

          this.log(`Updated last seen for ${newUser.username}`);
        });
      }
    });
  }

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += `\`\`\`@${nickname} seen [@user]\`\`\``;

    return msg;
  }

  message(msg) {
    const seenRegex = new RegExp(`^seen ${Aquarius.Triggers.mentionRegex}$`, 'i');

    if (Aquarius.Triggers.messageTriggered(msg, seenRegex)) {
      const user = msg.mentions.users.first();

      // untagged @mention, which Regex returns as a false positive
      if (user === undefined) {
        return;
      }

      this.log(`Seen request for ${user}`);

      if (user.status !== 'offline') {
        msg.channel.sendMessage("They're online right now!");
        return;
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
          msg.channel.sendMessage(`I don't have a record for ${user.username}`);
          return;
        }

        time = moment(seen.lastSeen * 1000);

        Aquarius.Users.getNickname(msg.channel.guild, user).then(nick => {
          msg.channel.sendMessage(`${nick} last seen ${time.fromNow()}`);
        });
      });
    }
  }
}

module.exports = new SeenCommand();
