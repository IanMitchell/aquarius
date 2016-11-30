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

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += '\nExample:\n';
    msg += '```';
    msg += `bot be nice\n`;
    msg += '=> sorry :(\n';
    msg += `@${nickname} reply add "trigger" "response"\n`;
    msg += '=> Response added\n';
    msg += `trigger\n`;
    msg += '=> response\n';
    msg += `@${nickname} reply remove "trigger"\n`;
    msg += '=> Response removed\n\n';
    msg += `@${nickname} replies\n`;
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
      return;
    }

    if (Aquarius.Triggers.messageTriggered(msg, /^replies$/i)) {
      if (this.responses.has(msg.guild.id)) {
        let str = `**Replies Set:**\n\n`;

        this.responses.get(msg.guild.id).forEach((value, key) => {
          str += `* '${key}'\n`;
        });

        msg.channel.sendMessage(str);
      } else {
        msg.channel.sendMessage('No replies have been set.');
      }
    }

    if (this.responses.has(msg.guild.id)) {
      if (this.responses.get(msg.guild.id).has(msg.cleanContent.trim().toLowerCase())) {
        this.log(`Input: ${msg.cleanContent}`);
        msg.channel.sendMessage(this.responses.get(msg.guild.id).get(msg.cleanContent.trim().toLowerCase()));
      }
    } else {
      this.addGuild(msg.guild.id);

      if (this.genericResponses().has(msg.cleanContent.trim().toLowerCase())) {
        msg.channel.sendMessage(this.genericResponses().get(msg.cleanContent.trim().toLowerCase()));
      }
    }

    if (Aquarius.Permissions.isGuildModerator(msg.guild, msg.author)) {
      const newRegex = new RegExp([
        '^(?:(?:new reply)|(?:reply add)) ',  // Cmd Trigger
        '(["\'])((?:(?=(\\\\?))\\3.)*?)\\1 ', // Reply trigger (Quoted text block 1)
        '(["\'])((?:(?=(\\\\?))\\3.)*?)\\1$', // Response (Quoted text block 2)
      ].join(''), 'i');

      const addInputs = Aquarius.Triggers.messageTriggered(msg, newRegex);
      const removeInputs = Aquarius.Triggers.messageTriggered(msg, /^reply remove "(.+)"$/i);

      if (addInputs) {
        addInputs[2] = addInputs[2].toLowerCase();  // Trigger case insensitivity

        this.log(`Adding reply: "${addInputs[2]}" -> "${addInputs[5]}"`);

        Reply.findOrCreate({
          where: {
            guildId: msg.guild.id,
            trigger: addInputs[2],
          },
          defaults: {
            response: addInputs[5],
          },
        }).spread((reply, created) => {
          if (created) {
            msg.channel.sendMessage('Added reply.');
            this.responses.get(msg.guild.id).set(addInputs[2].toLowerCase(), addInputs[5]);
          } else {
            msg.channel.sendMessage('A reply with that trigger already exists!');
          }
        });
      }

      if (removeInputs) {
        removeInputs[1] = removeInputs[1].toLowerCase();  // Trigger case insensitivity

        this.log(`Removing ${removeInputs[1]} reply`);

        // Remove from database
        Reply.destroy({
          where: {
            guildId: msg.guild.id,
            trigger: removeInputs[1],
          },
        }).then(removedRows => {
          if (removedRows > 0) {
            msg.channel.sendMessage(`Removed '${removeInputs[1]}' reply`);
            this.responses.get(msg.guild.id).delete(removeInputs[1]);
          } else {
            msg.channel.sendMessage(`Could not find a reply with '${removeInputs[1]}'`);
          }
        });
      }
    }
  }
}

module.exports = new ReplyCommand();
