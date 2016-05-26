const debug = require('debug');
const client = require('../client');
const triggers = require('../util/triggers');
const { isBotModerator } = require('../util/permissions');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);
const Reply = sequelize.import('../models/reply');

const log = debug('Reply');

// Server independent responses
const responses = new Map();
const genericResponses = new Map();
genericResponses.set('ping', 'pong');
genericResponses.set('bot respond', "I'm a pretty stupid bot.");
genericResponses.set('bot be nice', 'sorry :(');
genericResponses.set('gj bot', 'thx');
genericResponses.set('thx bot', 'np');
genericResponses.set('bot pls', '( ¬‿¬)');

// Create response map
client.on('ready', () => {
  log('Creating generic response map');
  client.servers.forEach(server => {
    responses.set(server.id, genericResponses);
  });

  // Load custom server replies
  log('Loading custom replies');

  Reply.findAll().then(replies => {
    replies.forEach(reply => {
      responses.get(reply.serverId).set(reply.trigger, reply.response);
    });

    log('Initialization done');
  });
});

const message = msg => {
  // Thanks Shaun <.<
  if (msg.author.bot) {
    return false;
  }

  if (responses.has(msg.channel.server.id)) {
    if (responses.get(msg.channel.server.id).has(msg.cleanContent.toLowerCase())) {
      log(`Input: ${msg.cleanContent}`);
      return responses.get(msg.channel.server.id).get(msg.cleanContent.toLowerCase());
    }
  } else {
    responses.set(msg.channel.server.id, genericResponses);
  }

  if (isBotModerator(msg.channel.server, msg.author)) {
    const newRegex = new RegExp([
      '^(?:(?:new reply)|(?:reply add)) ',  // Cmd Trigger
      '(["\'])((?:(?=(\\\\?))\\3.)*?)\\1 ', // Reply trigger (Quoted text block 1)
      '(["\'])((?:(?=(\\\\?))\\3.)*?)\\1$', // Response (Quoted text block 2)
    ].join(''), 'i');

    const addInputs = triggers.messageTriggered(msg, newRegex);
    const removeInputs = triggers.messageTriggered(msg, /^reply remove (.+)$/i);

    if (addInputs) {
      log(`Adding reply: "${addInputs[2]}" -> "${addInputs[5]}"`);

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
          responses.get(msg.channel.server.id).set(addInputs[2], addInputs[5]);
        } else {
          msg.client.sendMessage(msg.channel, 'A reply with that trigger already exists!');
        }
      });
    }

    if (removeInputs) {
      log('Removing reply');

      // Remove from database
      Reply.destroy({
        where: {
          serverId: msg.channel.server.id,
          trigger: removeInputs[1],
        },
      }).then(removedRows => {
        if (removedRows > 0) {
          msg.client.sendMessage(msg.channel, `Removed '${removeInputs[1]}' reply`);
          responses.get(msg.channnel.server.id).delete(removeInputs[1]);
        } else {
          msg.client.sendMessage(msg.channel, `Could not find a reply with '${removeInputs[1]}'`);
        }
      });
    }
  }

  return false;
};

let helpMessage = 'Reply automatically responds to certain phrases. \n';
helpMessage += 'To add a response, use `@bot reply add "trigger" "response"`.\n';
helpMessage += 'To remove a response, use `@bot reply remove "trigger"`.';

module.exports = {
  name: 'reply',
  help: helpMessage,
  message,
};
