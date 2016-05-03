const fs = require('fs');
const path = require('path');
const debug = require('debug');
const config = require('../config');
const aquarius = require('./client');

const log = debug('Aquarius');


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
  commands.forEach(command => {
    if (command.messageTriggered(message.content)) {
      aquarius.reply(message, command.message(message.content));
    }

    if (message.content.startsWith('.help') && command.helpTriggered(message.content)) {
      aquarius.reply(message, command.help());
    }
  });
});

aquarius.loginWithToken(config.token);
