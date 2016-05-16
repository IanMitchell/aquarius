const fs = require('fs');
const path = require('path');
const debug = require('debug');
const aquarius = require('./client');
const triggers = require('./util/triggers');
const moment = require('moment');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);
const Seen = sequelize.import('./models/seen');

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
  } else {
    commands.forEach(command => {
      const response = command.message(message);
      if (response) {
        aquarius.sendMessage(message.channel, response);
      }
    });
  }
});

// TODO: Figure out a way to move this into the 'seen' command
aquarius.on('presence', (oldUser, newUser) => {
  if (newUser.status === 'offline') {
    Seen.findOrCreate({
      where: {
        userId: newUser.id,
      },
      defaults: {
        lastSeen: moment().unix(),
      },
    }).spread((user, created) => {
      if (!created) {
        user.update({ lastSeen: moment().unix() });
      }

      log(`Updated last seen for ${newUser.username}`);
    });
  }
});

aquarius.loginWithToken(process.env.TOKEN);
