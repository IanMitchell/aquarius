const triggers = require('../util/triggers');
const permissions = require('../util/permissions');
const Command = require('../core/command');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);
const Reply = sequelize.import('../models/reply');

class ReplyCommand extends Command {
  constructor() {
    super();
    this.name = 'Reply';

    // All responses stored in memory
    this.responses = new Map();

    // Create response map
    this.client.on('ready', () => {
      this.log('Creating generic response map');
      this.client.servers.forEach(server => this.addServer(server.id));

      // Load custom server replies
      this.log('Loading custom replies');

      Reply.findAll().then(replies => {
        replies.forEach(reply => {
          if (!this.responses.has(reply.serverId)) {
            this.addServer(reply.serverId);
          }

          this.responses.get(reply.serverId).set(reply.trigger.toLowerCase(), reply.response);
        });

        this.log('Initialization done');
      });
    });
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

  addServer(serverId) {
    this.responses.set(serverId, new Map());

    this.genericResponses().forEach((value, key) => {
      this.responses.get(serverId).set(key.toLowerCase(), value);
    });
  }

  message(msg) {
    // Thanks Shaun <.<
    if (msg.author.bot) {
      return false;
    }

    if (this.responses.has(msg.channel.server.id)) {
      if (this.responses.get(msg.channel.server.id).has(msg.cleanContent.trim().toLowerCase())) {
        this.log(`Input: ${msg.cleanContent}`);
        return this.responses.get(msg.channel.server.id).get(msg.cleanContent.trim().toLowerCase());
      }
    } else {
      this.addServer(msg.channel.server.id);

      if (this.genericResponses().has(msg.cleanContent.trim().toLowerCase())) {
        return this.genericResponses().get(msg.cleanContent.trim().toLowerCase());
      }
    }

    if (permissions.isServerModerator(msg.channel.server, msg.author)) {
      const newRegex = new RegExp([
        '^(?:(?:new reply)|(?:reply add)) ',  // Cmd Trigger
        '(["\'])((?:(?=(\\\\?))\\3.)*?)\\1 ', // Reply trigger (Quoted text block 1)
        '(["\'])((?:(?=(\\\\?))\\3.)*?)\\1$', // Response (Quoted text block 2)
      ].join(''), 'i');

      const addInputs = triggers.messageTriggered(msg, newRegex);
      const removeInputs = triggers.messageTriggered(msg, /^reply remove (.+)$/i);

      if (addInputs) {
        this.log(`Adding reply: "${addInputs[2]}" -> "${addInputs[5]}"`);

        Reply.findOrCreate({
          where: {
            serverId: msg.channel.server.id,
            trigger: addInputs[2],
          },
          defaults: {
            response: addInputs[5],
          },
        }).spread((reply, created) => {
          if (created) {
            msg.client.sendMessage(msg.channel, 'Added reply.');
            this.responses.get(msg.channel.server.id).set(addInputs[2].toLowerCase(), addInputs[5]);
          } else {
            msg.client.sendMessage(msg.channel, 'A reply with that trigger already exists!');
          }
        });
      }

      if (removeInputs) {
        this.log('Removing reply');

        // Remove from database
        Reply.destroy({
          where: {
            serverId: msg.channel.server.id,
            trigger: removeInputs[1],
          },
        }).then(removedRows => {
          if (removedRows > 0) {
            msg.client.sendMessage(msg.channel, `Removed '${removeInputs[1]}' reply`);
            this.responses.get(msg.channel.server.id).delete(removeInputs[1]);
          } else {
            msg.client.sendMessage(msg.channel, `Could not find a reply with '${removeInputs[1]}'`);
          }
        });
      }
    }

    return false;
  }

  helpMessage() {
    let helpMessage = 'Reply automatically responds to certain phrases. \n';
    helpMessage += 'To add a response, use `@bot reply add "trigger" "response"`.\n';
    helpMessage += 'To remove a response, use `@bot reply remove "trigger"`.';

    return helpMessage;
  }
}

module.exports = new ReplyCommand();
