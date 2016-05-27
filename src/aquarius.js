const pkg = require('../package');
const fs = require('fs');
const path = require('path');
const debug = require('debug');
const aquarius = require('./client.js');
const triggers = require('./util/triggers');

const log = debug('Aquarius');

const commands = [];
const commandsPath = path.join(__dirname, 'commands/');

fs.readdir(commandsPath, (err, files) => {
  if (err) {
    throw err;
  }

  // TODO: Restrict to .js files
  files.forEach(file => {
    log(`Loading ${file}`);
    // eslint disable-line global-require
    commands.push(require(path.join(commandsPath, file)));
  });
});

aquarius.on('message', message => {
  if (triggers.messageTriggered(message, /^(commands|help)$/)) {
    log('Generating command list');
    let str = 'Available commands: ';
    str += commands.map(command => command.name).join(', ');
    str += '. For more information, use `@bot help [command]`.';
    aquarius.reply(message, str);
  } else if (triggers.messageTriggered(message, /^help .+$/)) {
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
  } else if (triggers.messageTriggered(message, /^info$/)) {
    log('Info request');
    aquarius.reply(message, `Aquarius v${pkg.version}. \`@aquarius help\` for help. http://github.com/${pkg.repository}`);
  } else {
    commands.forEach(command => {
      const response = command.message(message);
      if (response) {
        aquarius.sendMessage(message.channel, response);
      }
    });
  }
});

aquarius.loginWithToken(process.env.TOKEN);
