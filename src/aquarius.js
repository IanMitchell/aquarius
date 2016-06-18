const pkg = require('../package');
const fs = require('fs');
const path = require('path');
const debug = require('debug');
const aquarius = require('./core/client');
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

function handleQuery(message) {
  // When bot responds to a query, the event triggers; prevent infinite loop
  if (message.author.bot) {
    return;
  }

  const servers = users.getOwnedServers(message.author);

  // Handle regular users querying
  if (servers.length === 0) {
    aquarius.sendMessage(message.channel,
      `${generateInfo()}\n\nTo add the bot to your server, click here: ${generateBotLink()}`);
    return;
  }

  // TODO: Expand to allow unsetting
  const setMatch = triggers.messageTriggered(message, /^set ([0-9]+ )?([\w]+) ([\w]+) (.+)$/i);

  // TODO: if add/remove command
  if (triggers.messageTriggered(message, /^(add|remove)/)) {
    // get name || all
    // add or remove command if exists
      // if add, add command config entry
        // display available settings
        // prompt for settings
      // if remove, cleanup config
    // output list of commands otherwise
  } else if (setMatch) {
    let logstr = `Set '${setMatch[2]}#${setMatch[3]}' to ${setMatch[4]} `;
    logstr += `by ${message.author.name}`;

    // If the user owns multiple servers but doesn't set one
    // Else set the server to the only one they own
    if (servers.length > 1 && !setMatch[0]) {
      log(`${logstr} [SERVER FAIL]`);
      aquarius.sendMessage(message.channel,
        'You own multiple servers; please specify which one you mean.\n' +
        '`set [server] [command] [key] [value]`');
      return;
    } else if (servers.length === 1) {
      setMatch[0] = servers[0];
    }

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
  } else {
    // Check for help request - if it doesn't trigger, send info
    if (!handleHelp(message, true)) {
      aquarius.sendMessage(message.channel, `Sorry, I didn't understand!\n\n${generateInfo()}`);
    }
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
