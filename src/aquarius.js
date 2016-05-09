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
  const botMention = aquarius.user.mention();

  if (message.content.toLowerCase() === `${botMention} commands` ||
      message.content.toLowerCase() === `${botMention} help`) {
    log('Generating command list');
    let str = 'Available commands: ';
    str += commands.map(command => command.name).join(', ');
    str += '. For more information, use `@bot help [command]`.';
    aquarius.reply(message, str);
  } else if (message.content.toLowerCase().startsWith(`${botMention} help`)) {
    let str = '';
    commands.forEach(command => {
      if (message.cleanContent.toLowerCase().includes(command.name)) {
        log(`Help request for ${command.name}`);
        str += `${command.help}\n`;
      }
    });

    if (str !== '') {
      aquarius.reply(message, str);
    } else {
      aquarius.reply(message, 'Module not found :(');
    }
  } else {
    commands.forEach(command => {
      const response = command.message(message);
      if (response) {
        aquarius.sendMessage(message.channel, response);
      }
    });
  }
});

aquarius.loginWithToken(config.token);
