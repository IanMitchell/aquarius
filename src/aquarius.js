const eightball = require('./commands/eightball');
const config = require('../config');
const Discord = require('discord.js');

const aquarius = new Discord.Client();

aquarius.on('message', message => {
  if (message.content.startsWith('.help')) {
    if (eightball.helpTriggered(message.content)) {
      aquarius.reply(message, eightball.help());
    }
  }

  if (eightball.triggered(message.content)) {
    aquarius.reply(message, eightball.message());
  }

  if (message.content === 'ping') {
    aquarius.reply(message, 'pong');
  }
});

aquarius.loginWithToken(config.token);
