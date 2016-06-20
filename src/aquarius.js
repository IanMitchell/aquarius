const pkg = require('../package');
const fs = require('fs');
const path = require('path');
const debug = require('debug');
const aquarius = require('./core/client');
const settings = require('./core/settings');
const triggers = require('./util/triggers');
const permissions = require('./util/permissions');
const users = require('./util/users');

const log = debug('Aquarius');

const commands = new Map();

function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands/');

  fs.readdir(commandsPath, (err, files) => {
    if (err) {
      throw err;
    }

    files.forEach(file => {
      if (file.endsWith('.js')) {
        log(`Loading ${file}`);
        const cmd = require(path.join(commandsPath, file));
        commands.set(cmd.name, cmd);
      }
    });
  });
}

// Returns short list of all commands
// TODO: Filter commands by server availability
function generateCommandList(message, admin = false) {
  log('Generating command list');

  let str = '**Available commands**\n';

  if (admin) {
    commands.forEach(command => {
      str += `* *${command.name}* - ${command.description}\n`;
    });

    str += '\n for more information, use `help [command]`';
  } else {
    str += [...commands.keys()].map(command => {
      if (permissions.hasPermission(message.server, aquarius.user, command)) {
        return command;
      }

      return '';
    }).filter(Boolean).join(', ');
    str += `.\n\nFor more information, use \`@${aquarius.user.name} help [command]\`.`;
  }

  return str;
}

function generateInfo() {
  log('Info request');
  let str = `Aquarius v${pkg.version}. `;
  str += '`@aquarius help` for help.';
  str += `http://github.com/${pkg.repository}`;
  return str;
}

function generateBotLink() {
  const url = `https://discordapp.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}`;
  return `${url}&scope=bot&permissions=0`;
}

function generateCommandHelp(message, admin) {
  let str = '';

  const isAdminQuery = (users.getOwnedServers(message.author).length > 0 &&
                        message.server === undefined);

  [...commands.values()].forEach(command => {
    if (isAdminQuery || permissions.hasPermission(message.server, aquarius.user, command.name)) {
      if (message.cleanContent.toLowerCase().includes(command.name.toLowerCase())) {
        log(`Help request for ${command.name}`);

        if (admin) {
          str += `${command.helpMessage()}`;
          str += `\n\n*Configuration Options:*\n`;

          [...command.getKeys()].forEach(key => {
            str += `* \`${key}\` (Default: ${command.getSettingDefault(key)}): `;
            str += `${command.getSettingDescription(key)}\n`;
          });
        } else {
          str += `${command.helpMessage()}`;
        }
      }
    }
  });

  if (str === '') {
    str = 'Module not found :(';
  }

  return str;
}

function handleHelp(message, admin = false) {
  if (triggers.messageTriggered(message, /^(list|commands|help)$/)) {
    aquarius.sendMessage(message.channel, generateCommandList(message, admin));
    return true;
  } else if (triggers.messageTriggered(message, /^help .+$/)) {
    aquarius.sendMessage(message.channel, generateCommandHelp(message, admin));
    return true;
  }

  return false;
}

function handleInfo(message) {
  if (triggers.messageTriggered(message, /^info$/)) {
    aquarius.sendMessage(message.channel, generateInfo());
  }
}

// Handle admin alerts
function handleBroadcast(msg) {
  if (permissions.isBotOwner(msg.author)) {
    if (triggers.messageTriggered(msg, /^broadcast .+$/)) {
      const broadcast = msg.content.split('broadcast ');
      log(`Broadcasting '${broadcast[1]}'`);

      aquarius.servers.forEach(server => {
        aquarius.sendMessage(server.defaultChannel, `[BROADCAST] ${broadcast[1]}`);
      });
    }
  }
}

function addCommand(message, serverId, command) {
  settings.addCommand(serverId, command.name);
  aquarius.sendMessage(message.channel, `Added ${command.name}.`);

  // TODO: Instead of displaying, prompt for settings
  let str = '';
  [...command.getKeys()].forEach(key => {
    str += `* \`${key}\` (Default: ${command.getSettingDefault(key)}): `;
    str += `${command.getSettingDescription(key)}\n`;
  });

  if (str) {
    aquarius.sendMessage(message.channel,
      `**Configuration Settings**\n\n${str}\n\n\`set [command] [key] [value]\``);
  }
}

function handleAdminCommandChange(message, cmdMatch) {
  if (cmdMatch[1] === 'add') {
    if (cmdMatch[3] === 'all') {
      [...commands.values()].forEach(command => {
        addCommand(message, cmdMatch[2], command);
      });
    } else {
      if (commands.has(cmdMatch[3].toLowerCase())) {
        const command = commands.get(cmdMatch[3].toLowerCase());
        addCommand(message, cmdMatch[2], command);
      } else {
        aquarius.sendMessage(message.channel, `Command ${cmdMatch[3]} not found.`);
      }
    }
  } else {
    if (cmdMatch[3].toLowerCase() === 'all') {
      settings.clearCommands(cmdMatch[2]);
      aquarius.sendMessage(message.channel, 'All commands removed.');
    } else {
      if (commands.has(cmdMatch[3].toLowerCase())) {
        const name = commands.get(cmdMatch[3].toLowerCase()).name;
        log(cmdMatch[2]);
        settings.removeCommand(cmdMatch[2], name);
        aquarius.sendMessage(message.channel, `${name} removed.`);
      } else {
        aquarius.sendMessage(message.channel, 'Command not found!');
      }
    }
  }
}

function handleAdminConfigChange(message, setMatch) {
  let logstr = `Set '${setMatch[2]}#${setMatch[3]}' to ${setMatch[4]} `;
  logstr += `by ${message.author.name}`;

  // If the user didn't specify a valid command
  if (!commands.has(setMatch[2].toLowerCase())) {
    log(`${logstr} [CMD FAIL]`);
    aquarius.sendMessage(message.channel,
      `Command ${setMatch[1]} not found! Use \`help\` for a list of commands.`);
    return;
  }

  // If the command doesn't have that key
  const keys = [...commands.get(setMatch[2].toLowerCase()).getKeys()];
  if (!keys.includes(setMatch[3])) {
    log(`${logstr} [KEY FAIL]`);
    aquarius.sendMessage(message.channel,
      `${setMatch[2]} key \`${setMatch[3]}\` not found! Valid keys: ${keys.join(', ')}.`);
    return;
  }

  // Update the key
  log(`${logstr}`);
  commands.get(setMatch[2].toLowerCase()).setSetting(setMatch[0], setMatch[3], setMatch[4]);
  aquarius.sendMessage(message.channel, `Successfully updated ${setMatch[2]}`);
}

function handleAdminCommands(message, servers) {
  const cmdMatch = triggers.messageTriggered(message, /^(add|remove) ([0-9]+ )?(.+)$/i);
  // TODO: Expand to allow unsetting
  const setMatch = triggers.messageTriggered(message, /^set ([0-9]+ )?([\w]+) ([\w]+) (.+)$/i);

  if (cmdMatch) {
    if (servers.length > 1 && !cmdMatch[2]) {
      aquarius.sendMessage(message.channel,
        'You own multiple servers; please specify which one you mean.\n' +
        '`[add|remove] [server] [all|<command>]`');
      return;
    } else if (servers.length > 1 && cmdMatch[2]) {
      if (!servers.includes(cmdMatch[2])) {
        aquarius.sendMessage(message.channel, "You don't own that server!");
        return;
      }
    } else if (servers.length === 1) {
      cmdMatch[2] = servers[0].id;
    }

    handleAdminCommandChange(message, cmdMatch);
  } else if (setMatch) {
    if (servers.length > 1 && !setMatch[1]) {
      aquarius.sendMessage(message.channel,
        'You own multiple servers; please specify which one you mean.\n' +
        '`set [server] [command] [key] [value]`');
      return;
    } else if (servers.length > 1 && setMatch[1]) {
      if (!servers.includes(setMatch[1])) {
        aquarius.sendMessage(message.channel, "You don't own that server!");
        return;
      }
    } else if (servers.length === 1) {
      setMatch[1] = servers[0].id;
    }

    handleAdminConfigChange(message, setMatch);
  } else {
    // Check for help request - if it doesn't trigger, send info
    if (!handleHelp(message, true)) {
      aquarius.sendMessage(message.channel, `Sorry, I didn't understand!\n\n${generateInfo()}`);
    }
  }
}

function handleQuery(message) {
  // When bot responds to a query, the event triggers; prevent infinite loop
  if (message.author.bot) {
    return;
  }

  const servers = users.getOwnedServers(message.author);

  if (servers.length > 0) {
    handleAdminCommands(message, servers);
  } else {
    aquarius.sendMessage(message.channel,
      `${generateInfo()}\n\nTo add the bot to your server, click here: ${generateBotLink()}`);
  }
}

function handleCommands(message) {
  commands.forEach(command => {
    if (permissions.hasPermission(message.server, message.author, command.name)) {
      const response = command.message(message);
      if (response) {
        aquarius.sendMessage(message.channel, response);
      }
    }
  });
}

aquarius.on('message', message => {
  if (message.server === undefined) {
    handleQuery(message);
  } else {
    if (!permissions.isServerMuted(message.server, message.author)) {
      handleBroadcast(message);
      handleHelp(message);
      handleInfo(message);
      handleCommands(message);
    }
  }
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

// Start the bot!
aquarius.loginWithToken(process.env.TOKEN);
aquarius.on('ready', loadCommands);
