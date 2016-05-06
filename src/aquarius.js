const fs = require('fs');
const path = require('path');
const debug = require('debug');
const Discord = require('discord.js');
const config = require('../config');

const log = debug('Aquarius');
const aquarius = new Discord.Client();

const commands = [];
const commandsPath = path.join(__dirname, 'commands/');

fs.readdir(commandsPath, (err, files) => {
  if (err) {
    throw err;
  }

  files.forEach(file => {
    log(`Loading ${file}`);
    // eslint disable-line global-require
    commands.push(require(path.join(commandsPath, file)));
  });
});

aquarius.on('message', message => {
  if (message.cleanContent.toLowerCase() === '@aquarius commands' ||
      message.cleanContent.toLowerCase() === '@aquarius help') {
    log('Generating command list');
    let str = 'Available commands: ';
    str += commands.map(command => command.name).join(', ');
    aquarius.reply(message, str);
  } else if (message.cleanContent.toLowerCase().startsWith('@aquarius help')) {
    let str = '';
    commands.forEach(command => {
      if (message.cleanContent.toLowerCase().includes(command.name)) {
        log(`Help request for ${message.name}`);
        str += `${command.help}\n`;
      }
    });
    aquarius.reply(message, str);
  } else {
    commands.forEach(command => {
      if (command.triggered(message)) {
        aquarius.sendMessage(message.channel, command.message(message));
      }
    });
  }
});

aquarius.loginWithToken(config.token);
