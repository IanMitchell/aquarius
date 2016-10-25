const fs = require('fs');
const path = require('path');
const debug = require('debug');
const Aquarius = require('./aquarius');

const log = debug('Aquarius');
// log.log = require('./dashboard/log');

// Stores a map of all the configurable commands
// and the core / global commands
const commands = {
  core: new Map(),
  plugins: new Map(),
};


function loadCommands(filePath) {
  const cmds = new Map();

  fs.readdir(filePath, (err, files) => {
    if (err) {
      throw err;
    }

    files.forEach(file => {
      if (file.endsWith('.js')) {
        log(`Loading ${file}`);
        // eslint-disable-next-line global-require
        const cmd = require(path.join(filePath, file));
        cmds.set(cmd.name.toLowerCase(), cmd);
      }
    });
  });

  return cmds;
}

function initializeCommands() {
  commands.core = loadCommands(path.join(__dirname, 'global/'));
  commands.plugins = loadCommands(path.join(__dirname, 'commands/'));
}


function generateAdminCommandList() {
  log('Generating Admin Command List');

  let str = '**Available Commands**\n';

  // TODO: Filter by server availability
  commands.plugins.forEach(command => {
    str += `* *${command.name}* - ${command.description}\n`;
  });

  str += '\n for more information, use `help [command]`';

  return str;
}

function generateAdminCommandHelp(message) {
  let str = '';

  [...commands.plugins.values()].forEach(command => {
    if (message.cleanContent.toLowerCase().includes(command.name.toLowerCase())) {
      log(`Help request for ${command.name}`);

      const keys = [...command.getKeys()];
      str += `${command.helpMessage(Aquarius.Client.user.username)}`;

      if (keys.length > 0) {
        str += `\n\n*Configuration Options:*\n`;

        keys.forEach(key => {
          str += `* \`${key}\` (Default: ${command.getSettingDefault(key)}): `;
          str += `${command.getSettingDescription(key)}\n`;
        });
      }
    }
  });

  if (str === '') {
    str = 'Module not found :(';
  }

  message.channel.sendMessage(str);
}

function generateCommandHelp(message) {
  let str = '';

  Aquarius.Users.getNickname(message.guild, Aquarius.Client.user).then(nickname => {
    [...commands.plugins.values()].forEach(command => {
      if (Aquarius.Permissions.hasPermission(message.guild, Aquarius.Client.user, command) &&
          message.cleanContent.toLowerCase().includes(command.name.toLowerCase())) {
        log(`Help request for ${command.name}`);

        str += `${command.helpMessage(nickname)}`;
      }
    });

    if (str === '') {
      str = 'Module not found :(';
    }

    message.channel.sendMessage(str);
  });
}

function generateCommandNameList(message) {
  let str = '**Available commands**\n';

  str += [...commands.plugins.keys()].map(command => {
    if (Aquarius.Permissions.hasPermission(message.guild,
                                           Aquarius.Client.user,
                                           commands.plugins.get(command))) {
      return command;
    }

    return '';
  }).filter(Boolean).join(', ');
  str += `.\n\nFor more information, use \`@${Aquarius.Client.user.username} help [command]\`.`;

  return str;
}


function adminAddCommandHandler(message, cmdMatch) {
  if (cmdMatch[3].toLowerCase() === 'all') {
    [...commands.plugins.values()].forEach(command => {
      Aquarius.Admin.addCommand(message, cmdMatch[2], command);
    });
  } else if (commands.plugins.has(cmdMatch[3].toLowerCase())) {
    const command = commands.plugins.get(cmdMatch[3].toLowerCase());
    Aquarius.Admin.addCommand(message, cmdMatch[2], command);
  } else {
    message.channel.sendMessage(`Command ${cmdMatch[3]} not found.`);
  }
}

function adminRemoveCommandHandler(message, cmdMatch) {
  if (cmdMatch[3].toLowerCase() === 'all') {
    Aquarius.Settings.clearCommands(cmdMatch[2]);
    message.channel.sendMessage('All commands removed.');
  } else if (commands.plugins.has(cmdMatch[3].toLowerCase())) {
    const cmd = commands.plugins.get(cmdMatch[3].toLowerCase());
    Aquarius.Settings.removeCommand(cmdMatch[2], cmd.constructor.name);
    message.channel.sendMessage(`${cmd.name} removed.`);
  } else {
    message.channel.sendMessage('Command not found!');
  }
}

function handleAdminCommandChange(message, cmdMatch) {
  log(`Handling ${cmdMatch[1]} on ${cmdMatch[3]} for ${cmdMatch[2]}`);
  if (cmdMatch[1].toLowerCase() === 'add') {
    adminAddCommandHandler(message, cmdMatch);
  } else if (cmdMatch[1].toLowerCase() === 'remove') {
    adminRemoveCommandHandler(message, cmdMatch);
  }
}

function handleAdminConfigChange(message, setMatch) {
  let logstr = `Set '${setMatch[2]}#${setMatch[3]}' to ${setMatch[4]} `;
  logstr += `by ${message.author.name}`;

  // If the user didn't specify a valid command
  if (!commands.plugins.has(setMatch[2].toLowerCase())) {
    log(`${logstr} [CMD FAIL]`);
    message.channel.sendMessage(`Command ${setMatch[1]} not found! Use \`help\` for a list of commands.`);
    return;
  }

  // If the command doesn't have that key
  const keys = [...commands.plugins.get(setMatch[2].toLowerCase()).getKeys()];
  keys.push('permission');

  if (!keys.includes(setMatch[3])) {
    log(`${logstr} [KEY FAIL]`);
    message.channel.sendMessage(`${setMatch[2]} key \`${setMatch[3]}\` not found! Valid keys: ${keys.join(', ')}.`);
    return;
  }

  // Update the key
  log(`${logstr}`);

  if (setMatch[3] !== 'permission') {
    commands.plugins.get(setMatch[2].toLowerCase()).setSetting(setMatch[1], setMatch[3], setMatch[4]);
    message.channel.sendMessage(`Successfully updated ${setMatch[2]}`);
  } else if (commands.plugins.get(setMatch[2].toLowerCase()).setPermission(setMatch[1], setMatch[4])) {
    message.channel.sendMessage(`Successfully updated ${setMatch[2]}`);
  } else {
    message.channel.sendMessage('ERROR: Please use [ADMIN, RESTRICTED, ALL].');
  }
}


function handleHelp(message) {
  const guilds = Aquarius.Users.getOwnedGuilds(message.author);
  const admin = ((message.guild === undefined || message.guild === null) && guilds.length > 0);

  if (Aquarius.Triggers.messageTriggered(message, /^(list|commands|help)$/)) {
    if (admin) {
      message.channel.sendMessage(generateAdminCommandList(message));
    } else {
      message.channel.sendMessage(generateCommandNameList(message));
    }

    return true;
  } else if (Aquarius.Triggers.messageTriggered(message, /^help .+$/)) {
    if (admin) {
      message.channel.sendMessage(generateAdminCommandHelp(message));
    } else {
      message.channel.sendMessage(generateCommandHelp(message));
    }

    return true;
  }

  return false;
}

function handleCommands(message) {
  commands.core.forEach(command => command.message(message));

  commands.plugins.forEach(command => {
    if (Aquarius.Permissions.hasPermission(message.guild, message.author, command)) {
      command.message(message);
    }
  });
}


// TODO: Refactor
function handleAdminCommands(message, guilds) {
  const cmdMatch = Aquarius.Triggers.messageTriggered(message, /^(add|remove) (?:([0-9]+) )?(.+)$/i);
  const roleMatch = Aquarius.Triggers.messageTriggered(message, /^create roles( [0-9]+)?$/i);
  // TODO: Expand to allow unsetting
  const setMatch = Aquarius.Triggers.messageTriggered(message,
                                                      /^set ([0-9]+ )?([\w]+) ([\w]+) (.+)$/i);

  if (cmdMatch) {
    if (guilds.length > 1 && !cmdMatch[2]) {
      message.channel.sendMessage(
        'You are an admin on multiple servers; please specify which one you mean.\n' +
        '`[add|remove] [server] [all|<command>]`');
      return;
    } else if (guilds.length > 1 && cmdMatch[2]) {
      if (!guilds.some(g => g.id === cmdMatch[2])) {
        message.channel.sendMessage("You aren't an admin on that server!");
        return;
      }
    } else if (guilds.length === 1) {
      cmdMatch[2] = guilds[0].id;
    }

    handleAdminCommandChange(message, cmdMatch);
  } else if (setMatch) {
    if (guilds.length > 1 && !setMatch[1]) {
      message.channel.sendMessage(
        'You are an admin on multiple servers; please specify which one you mean.\n' +
        '`set [server] [command] [key] [value]`');
      return;
    } else if (guilds.length > 1 && setMatch[1]) {
      if (!guilds.some(g => g.id === setMatch[1])) {
        message.channel.sendMessage("You aren't an admin on that server!");
        return;
      }
    } else if (guilds.length === 1) {
      setMatch[1] = guilds[0].id;
    }

    handleAdminConfigChange(message, setMatch);
  } else if (roleMatch) {
    if (guilds.length > 1 && !roleMatch[1]) {
      message.channel.sendMessage(
        'You are an admin on multiple servers; please specify which one you mean.\n' +
        '`create roles [server]`');
      return;
    } else if (guilds.length > 1 && roleMatch[1]) {
      if (!guilds.some(g => g.id === roleMatch[1])) {
        message.channel.sendMessage("You aren't an admin on that server!");
        return;
      }
    } else if (guilds.length === 1) {
      roleMatch[1] = guilds[0].id;
    }

    Aquarius.Admin.createRoles(message, roleMatch[1]);
  } else if (!handleHelp(message)) {
    message.channel.sendMessage("Sorry, I didn't understand!");
  }
}

function handleQuery(message) {
  // When bot responds to a query, the event triggers
  if (message.author.bot) {
    return;
  }

  const guilds = Aquarius.Users.getGuildsWithAdmin(message.author);

  if (guilds.length > 0) {
    handleAdminCommands(message, guilds);
  } else {
    message.channel.sendMessage(`Sorry, queries are restricted to server admins.\n\n` +
      `To add the bot to your server, click here: ${Aquarius.Links.botLink()}`);
  }
}

function handleMessage(message) {
  if (message.guild === undefined || message.guild === null) {
    handleQuery(message);
  } else if (!Aquarius.Permissions.isGuildMuted(message.guild, message.author)) {
    handleHelp(message);
    handleCommands(message);
  }
}


// Register Handlers
Aquarius.Client.on('message', handleMessage);
Aquarius.Client.on('guildCreated', Aquarius.Admin.addGuild);

// Start the bot!
Aquarius.Client.login(process.env.TOKEN);
Aquarius.Client.on('ready', initializeCommands);
