const Aquarius = require('../aquarius');
const Reply = Aquarius.Sequelize.import('../models/reply');

class ReplyCommand extends Aquarius.Command {
  constructor() {
    super();
    this.name = 'Reply';

    this.description = 'Configure the bot to automatically respond to phrases';

    // All responses stored in memory
    this.responses = new Map();

    // Create response map
    this.log('Creating generic response map');
    Aquarius.Client.guilds.forEach(guild => this.addGuild(guild.id));

    // Load custom server replies
    this.log('Loading custom replies');

    Reply.findAll().then(replies => {
      replies.forEach(reply => {
        if (!this.responses.has(reply.guildId)) {
          this.addGuild(reply.guildId);
        }

        this.responses.get(reply.guildId).set(reply.trigger.toLowerCase(), reply.response);
      });

      this.log('Initialization done');
    });
  }

  helpMessage(guild) {
    let msg = super.helpMessage();
    const nickname = Aquarius.Users.getNickname(guild, Aquarius.Client.user);

    msg += '\nExample:\n';
    msg += '```';
    msg += `bot be nice\n`;
    msg += '=> sorry :(\n';
    msg += `@${nickname} reply add "trigger" "response"\n`;
    msg += '=> Response added\n';
    msg += `trigger\n`;
    msg += '=> response\n';
    msg += `@${nickname} reply remove trigger\n`;
    msg += '=> Response removed\n';
    msg += '```';

    return msg;
  }

  genericResponses() {
    // Cross server replies
    const genericResponses = new Map();
    genericResponses.set('ping', 'pong');
    genericResponses.set('bot respond', "I'm a pretty stupid bot.");
    genericResponses.set('bot be nice', 'sorry :(');
    genericResponses.set('gj bot', 'thx');
    genericResponses.set('thx bot', 'np');
    genericResponses.set('bot pls', '( ¬‿¬)');

    return genericResponses;
  }

  addGuild(guildId) {
    this.responses.set(guildId, new Map());

    this.genericResponses().forEach((value, key) => {
      this.responses.get(guildId).set(key.toLowerCase(), value);
    });
  }

  message(msg) {
    // Thanks Shaun <.<
    if (msg.author.bot) {
      return false;
    }

    if (this.responses.has(msg.channel.guild.id)) {
      if (this.responses.get(msg.channel.guild.id).has(msg.cleanContent.trim().toLowerCase())) {
        this.log(`Input: ${msg.cleanContent}`);
        return this.responses.get(msg.channel.guild.id).get(msg.cleanContent.trim().toLowerCase());
      }
    } else {
      this.addGuild(msg.channel.guild.id);

      if (this.genericResponses().has(msg.cleanContent.trim().toLowerCase())) {
        return this.genericResponses().get(msg.cleanContent.trim().toLowerCase());
      }
    }

    if (Aquarius.Permissions.isGuildModerator(msg.channel.guild, msg.author)) {
      const newRegex = new RegExp([
        '^(?:(?:new reply)|(?:reply add)) ',  // Cmd Trigger
        '(["\'])((?:(?=(\\\\?))\\3.)*?)\\1 ', // Reply trigger (Quoted text block 1)
        '(["\'])((?:(?=(\\\\?))\\3.)*?)\\1$', // Response (Quoted text block 2)
      ].join(''), 'i');

      const addInputs = Aquarius.Triggers.messageTriggered(msg, newRegex);
      const removeInputs = Aquarius.Triggers.messageTriggered(msg, /^reply remove (.+)$/i);

      if (addInputs) {
        this.log(`Adding reply: "${addInputs[2]}" -> "${addInputs[5]}"`);

        Reply.findOrCreate({
          where: {
            guildId: msg.channel.guild.id,
            trigger: addInputs[2],
          },
          defaults: {
            response: addInputs[5],
          },
        }).spread((reply, created) => {
          if (created) {
            msg.channel.sendMessage('Added reply.');
            this.responses.get(msg.channel.guild.id).set(addInputs[2].toLowerCase(), addInputs[5]);
          } else {
            msg.channel.sendMessage('A reply with that trigger already exists!');
          }
        });
      }

      if (removeInputs) {
        this.log(`Removing ${removeInputs[1]} reply`);

        // Remove from database
        Reply.destroy({
          where: {
            guildId: msg.channel.guild.id,
            trigger: removeInputs[1],
          },
        }).then(removedRows => {
          if (removedRows > 0) {
            msg.channel.sendMessage(`Removed '${removeInputs[1]}' reply`);
            this.responses.get(msg.channel.guild.id).delete(removeInputs[1]);
          } else {
            msg.channel.sendMessage(`Could not find a reply with '${removeInputs[1]}'`);
          }
        });
      }
    }

    return false;
  }
}

module.exports = new ReplyCommand();
