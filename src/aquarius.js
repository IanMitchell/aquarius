const pkg = require('../package');
const fs = require('fs');
const path = require('path');
const debug = require('debug');
const aquarius = require('./core/client');
const triggers = require('./util/triggers');
const permissions = require('./util/permissions');

const log = debug('Aquarius');

const commands = [];
const commandsPath = path.join(__dirname, 'commands/');

// On start, load all commands
fs.readdir(commandsPath, (err, files) => {
  if (err) {
    throw err;
  }

  files.forEach(file => {
    if (file.endsWith('.js')) {
      log(`Loading ${file}`);
      commands.push(require(path.join(commandsPath, file)));
    }
  });
});

// Handle admin alerts
function handleBroadcast(msg) {
  if (permissions.isBotOwner(msg.author)) {
    if (triggers.messageTriggered(msg, /^broadcast .+$/)) {
      const broadcast = msg.content.split('broadcast ');
      log(`Broadcasting '${broadcast[1]}'`);

      msg.client.servers.forEach(server => {
        server.client.sendMessage(server.defaultChannel, `[BROADCAST] ${broadcast[1]}`);
      });
    }
  }
}

function handleHelp(message) {
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
  }
}

function handleInfo(message) {
  if (triggers.messageTriggered(message, /^info$/)) {
    log('Info request');
    aquarius.reply(message, `Aquarius v${pkg.version}. \`@aquarius help\` for help. http://github.com/${pkg.repository}`);
  }
}

// TODO: Handle PMs and server admin requests
aquarius.on('message', message => {
  if (message.server === undefined || permissions.isServerMuted(message.server, message.author)) {
    return;
  }

  handleBroadcast(message);
  handleHelp(message);
  handleInfo(message);

  commands.forEach(command => {
    if (permissions.hasPermission(message.server.id, message.author, command.name)) {
      const response = command.message(message);
      if (response) {
        aquarius.sendMessage(message.channel, response);
      }
    }
  });
});

aquarius.on('serverCreated', server => {
  let msg = `**Thanks for adding ${aquarius.user.name}!**\n`;
  msg += "I'm an open source bot run by Ian (Desch#1935). If you'd like to see the code, ";
  msg += 'file a bug, or have a feature request you can visit https://github.com/IanMitchell/aquarius. ';
  msg += `For general information about me, you can say \`@${aquarius.user.name} info\`\n`;
  msg += '\n\n';
  msg += "You'll need to add commands to your server for the bot to be functional. ";
  msg += `To get a list of commands, you can message the bot \`@${aquarius.user.name} help\`\n`;
  msg += `Available commands: \`${commands.map(command => command.name).join(', ')}\`\n\n`;
  msg += `To find out more about a command, run \`@${aquarius.user.name} help [command]\`\n`;
  msg += 'To add or remove a command from your server, use ';
  msg += `\`@${aquarius.user.name} [add|remove] [command]\`.`;

  aquarius.sendMessage(server.owner, msg);
});

aquarius.loginWithToken(process.env.TOKEN);
