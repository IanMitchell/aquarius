const fs = require('fs');
const path = require('path');
const debug = require('debug');
const aquarius = require('./core/client');
const settings = require('./core/settings');
const triggers = require('./util/triggers');
const permissions = require('./util/permissions');
const users = require('./util/users');
const links = require('./util/links');

const log = debug('Aquarius');

const coreCommands = new Map();
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
        commands.set(cmd.name.toLowerCase(), cmd);
      }
    });
  });

  const corePath = path.join(__dirname, 'core/commands/');

  fs.readdir(corePath, (err, files) => {
    if (err) {
      throw err;
    }

    files.forEach(file => {
      if (file.endsWith('.js')) {
        log(`Loading ${file}`);
        const cmd = require(path.join(corePath, file));
        coreCommands.set(cmd.name.toLowerCase(), cmd);
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
      if (permissions.hasPermission(message.server, aquarius.user, commands.get(command))) {
        return command;
      }

      return '';
    }).filter(Boolean).join(', ');
    str += `.\n\nFor more information, use \`@${aquarius.user.name} help [command]\`.`;
  }

  return str;
}

function generateCommandHelp(message, admin) {
  let str = '';

  const isAdminQuery = (users.getOwnedServers(message.author).length > 0 &&
                        message.server === undefined);

  [...commands.values()].forEach(command => {
    if (isAdminQuery || permissions.hasPermission(message.server, aquarius.user, command)) {
      if (message.cleanContent.toLowerCase().includes(command.name.toLowerCase())) {
        log(`Help request for ${command.name}`);

        if (admin) {
          const keys = [...command.getKeys()];

          str += `${command.helpMessage(message.server)}`;

          if (keys.length > 0) {
            str += `\n\n*Configuration Options:*\n`;

            keys.forEach(key => {
              str += `* \`${key}\` (Default: ${command.getSettingDefault(key)}): `;
              str += `${command.getSettingDescription(key)}\n`;
            });
          }
        } else {
          str += `${command.helpMessage(message.server)}`;
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

function addCommand(message, serverId, command) {
  settings.addCommand(serverId, command.constructor.name);
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
        const cmd = commands.get(cmdMatch[3].toLowerCase());
        log(cmdMatch[2]);
        settings.removeCommand(cmdMatch[2], cmd.constructor.name);
        aquarius.sendMessage(message.channel, `${cmd.name} removed.`);
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
  keys.push('permission');

  if (!keys.includes(setMatch[3])) {
    log(`${logstr} [KEY FAIL]`);
    aquarius.sendMessage(message.channel,
      `${setMatch[2]} key \`${setMatch[3]}\` not found! Valid keys: ${keys.join(', ')}.`);
    return;
  }

  // Update the key
  log(`${logstr}`);

  if (setMatch[3] !== 'permission') {
    commands.get(setMatch[2].toLowerCase()).setSetting(setMatch[1], setMatch[3], setMatch[4]);
    aquarius.sendMessage(message.channel, `Successfully updated ${setMatch[2]}`);
  } else {
    if (commands.get(setMatch[2].toLowerCase()).setPermission(setMatch[1], setMatch[4])) {
      aquarius.sendMessage(message.channel, `Successfully updated ${setMatch[2]}`);
    } else {
      aquarius.sendMessage(message.channel, 'ERROR: Please use [ADMIN, RESTRICTED, ALL].');
    }
  }
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
      aquarius.sendMessage(message.channel, "Sorry, I didn't understand!");
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
      'Sorry, queries are restricted to server admins.\n\n' +
      `To add the bot to your server, click here: ${links.botLink()}`);
  }
}

function handleCoreCommands(message) {
  coreCommands.forEach(command => {
    const response = command.message(message);
    if (response) {
      aquarius.sendMessage(message.channel, response);
    }
  });
}

function handleCommands(message) {
  commands.forEach(command => {
    if (permissions.hasPermission(message.server, message.author, command)) {
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
      handleHelp(message);
      handleCoreCommands(message);
      handleCommands(message);
    }
  }
});

aquarius.on('serverCreated', server => {
  const name = aquarius.user.name;
  let msg = '';

  msg += `**Thanks for adding ${name}!**\n`;
  msg += `I'm a discord bot with different commands you can add to your server. I'm also open source - if you'd like to file a bug or have a feature request, you can visit ${links.repoLink()}. You can also contact Ian (Desch#1935).\n\n`;
  msg += `For general information about the bot you can say \`@${name} info\` in any server I'm in.`;

  aquarius.sendMessage(server.owner, msg);

  msg = '**Configuring The Bot**\n';
  msg += 'The server admin can set the bot nickname by typing `.nick [nickname]` in a server the bot is in.\n\n';
  msg += `You can add specific roles to your server to control ${name} actions as well. If a user has \`${name} Mod\` (or if you've changed the bot's nickname, \`[Nickname] Mod\`) the user will have elevated permissions (discussed later). If a user as \`${name} Muted\` (or \`[Nickname] Muted\`) the bot will ignore all commands from the user (with the exception of the server admin).\n\n`;
  msg += `If you'd like ${name} to automatically create these roles for you, type \`create roles\`. If you're running the bot on multiple servers you'll need to specify the server with \`create roles [server]\`.`;

  aquarius.sendMessage(server.owner, msg);

  msg = '**Adding Commands**\n';
  msg += "Out of the box I don't do very much - you'll need to enable different commands on your server. Just type `help` in this query at any time to get a list of the commands you can add to your server.\n\n";
  msg += "If you're interested in a command you can get additional information by sending `help [command]`.\n\n";
  msg += `To add a command, just say \`add [command|all]\`. If you are running ${name} on multiple servers, you'll need to specify by saying \`add [server] [command|all]\`.\n\n`;
  msg += `To remove a command say \`remove [command|all]\`. Like adding a command, if you're running ${name} on multiple servers you'll need to specify with \`remove [server] [command|all]\`.`;

  aquarius.sendMessage(server.owner, msg);

  msg = '**Configuring Commands**\n';
  msg += 'Some commands (for example, Karma) have configurable settings. When you add these commands the list of settings will be displayed - to pull them up later you can type `help [command]` in this query.\n\n';
  msg += "To set a variable, type `set [command] [name] [value]`. If you have the bot running on multiple servers you'll need to specify which one you're targeting with `set [server] [command] [name] [value]`.";

  aquarius.sendMessage(server.owner, msg);

  msg = '**Command Permissions**\n';
  msg += `${name} Commands have three permission levels - ADMIN, RESTRICTED, and ALL. Note that if a user has the \`${name} Muted\` role they cannot interact with the bot at all.\n\n`;
  msg += 'ADMIN: Only the server admin may use the command.\n';
  msg += `RESTRICTED: Only the server admin and \`${name} Mod\` role members may use the command.\n`;
  msg += `ALL: All server members may use the command.\n\n`;
  msg += "To set the permission level for a command use `set [command] permission [ADMIN|RESTRICTED|ALL]`. If you have multiple servers running the bot you'll need to use `set [server] [command] permission [ADMIN|RESTRICTED|ALL]`.";

  aquarius.sendMessage(server.owner, msg);
  settings.addServer(server.id);
  log(`Added to server ${server.id}`);
});

// Start the bot!
aquarius.loginWithToken(process.env.TOKEN);
aquarius.on('ready', loadCommands);
