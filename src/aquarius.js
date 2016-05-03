const eightball = require('./commands/eightball');
const config = require('../config');
const Discord = require('discord.js');

const aquarius = new Discord.Client();

aquarius.on('message', message => {
  if (eightball.trigger(message.content)) {
    if (message.content === '.8ball help') {
      aquarius.reply(message, eightball.help());
    } else {
      aquarius.reply(message, eightball.message());
    }
  }
  if (message.content === 'ping') {
    aquarius.reply(message, 'pong');
  }
});

aquarius.loginWithToken(config.token);
