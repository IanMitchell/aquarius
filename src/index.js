const fs = require('fs');
const path = require('path');
const debug = require('debug');
const Aquarius = require('./aquarius');

const log = debug('Aquarius');
// log.log = require('./dashboard/log');

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
        // eslint-disable-next-line global-require
        const cmd = require(path.join(commandsPath, file));
        commands.set(cmd.name.toLowerCase(), cmd);
      }
    });
  });

  const corePath = path.join(__dirname, 'global/');

  fs.readdir(corePath, (err, files) => {
    if (err) {
      throw err;
    }

    files.forEach(file => {
      if (file.endsWith('.js')) {
        log(`Loading ${file}`);
        // eslint-disable-next-line global-require
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
      if (Aquarius.Permissions.hasPermission(message.guild,
                                             Aquarius.Client.user,
                                             commands.get(command))) {
        return command;
      }

      return '';
    }).filter(Boolean).join(', ');
    str += `.\n\nFor more information, use \`@${Aquarius.Client.user.username} help [command]\`.`;
  }

  return str;
}

function generateCommandHelp(message, admin) {
  let str = '';

  const isAdminQuery = (Aquarius.Users.getOwnedGuilds(message.author).length > 0 &&
                        message.guild === undefined);

  [...commands.values()].forEach(command => {
    if (isAdminQuery || Aquarius.Permissions.hasPermission(message.guild,
                                                           Aquarius.Client.user,
                                                           command)) {
      if (message.cleanContent.toLowerCase().includes(command.name.toLowerCase())) {
        log(`Help request for ${command.name}`);

        if (admin) {
          const keys = [...command.getKeys()];

          str += `${command.helpMessage(message.guild)}`;

          if (keys.length > 0) {
            str += `\n\n*Configuration Options:*\n`;

            keys.forEach(key => {
              str += `* \`${key}\` (Default: ${command.getSettingDefault(key)}): `;
              str += `${command.getSettingDescription(key)}\n`;
            });
          }
        } else {
          str += `${command.helpMessage('Aquarius')}`;
          // TODO: Fix
          // str += `${command.helpMessage(message.guild)}`;
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
  if (Aquarius.Triggers.messageTriggered(message, /^(list|commands|help)$/)) {
    message.channel.sendMessage(generateCommandList(message, admin));
    return true;
  } else if (Aquarius.Triggers.messageTriggered(message, /^help .+$/)) {
    message.channel.sendMessage(generateCommandHelp(message, admin));
    return true;
  }

  return false;
}

function addCommand(message, guildId, command) {
  Aquarius.Settings.addCommand(guildId, command.constructor.name);
  message.channel.sendMessage(`Added ${command.name}.`).then(msg => {
    // TODO: Instead of displaying, prompt for settings
    let str = '';
    [...command.getKeys()].forEach(key => {
      str += `* \`${key}\` (Default: ${command.getSettingDefault(key)}): `;
      str += `${command.getSettingDescription(key)}\n`;
    });

    if (str) {
      message.channel.sendMessage(
        `**${command.name} Configuration Settings**\n\n${str}\n\n\`set [command] [key] [value]\``);
    }
  });
}

function createRoles(message, guildId) {
  const guild = Aquarius.Client.guilds.get('id', guildId);
  const nickname = Aquarius.Users.getNickname(guild, Aquarius.Client.user);

  const roles = ['Mod', 'Muted'];
  let str = '';

  roles.forEach(role => {
    if (guild.roles.has('name', `${nickname} ${role}`)) {
      str += `${role} role exists!\n`;
    } else {
      Aquarius.Client.createRole(guildId, {
        hoist: false,
        name: `${nickname} ${role}`,
        mentionable: true,
      });

      str += `${role} role created.\n`;
    }
  });

  message.author.sendMessage(str);
}

function handleAdminCommandChange(message, cmdMatch) {
  if (cmdMatch[1].toLowerCase() === 'add') {
    if (cmdMatch[3].toLowerCase() === 'all') {
      [...commands.values()].forEach(command => {
        addCommand(message, cmdMatch[2], command);
      });
    } else {
      if (commands.has(cmdMatch[3].toLowerCase())) {
        const command = commands.get(cmdMatch[3].toLowerCase());
        addCommand(message, cmdMatch[2], command);
      } else {
        message.channel.sendMessage(`Command ${cmdMatch[3]} not found.`);
      }
    }
  } else {
    if (cmdMatch[3].toLowerCase() === 'all') {
      Aquarius.Settings.clearCommands(cmdMatch[2]);
      message.channel.sendMessage('All commands removed.');
    } else {
      if (commands.has(cmdMatch[3].toLowerCase())) {
        const cmd = commands.get(cmdMatch[3].toLowerCase());
        log(cmdMatch[2]);
        Aquarius.Settings.removeCommand(cmdMatch[2], cmd.constructor.name);
        message.channel.sendMessage(`${cmd.name} removed.`);
      } else {
        message.channel.sendMessage('Command not found!');
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
    message.channel.sendMessage(
      `Command ${setMatch[1]} not found! Use \`help\` for a list of commands.`);
    return;
  }

  // If the command doesn't have that key
  const keys = [...commands.get(setMatch[2].toLowerCase()).getKeys()];
  keys.push('permission');

  if (!keys.includes(setMatch[3])) {
    log(`${logstr} [KEY FAIL]`);
    message.channel.sendMessage(
      `${setMatch[2]} key \`${setMatch[3]}\` not found! Valid keys: ${keys.join(', ')}.`);
    return;
  }

  // Update the key
  log(`${logstr}`);

  if (setMatch[3] !== 'permission') {
    commands.get(setMatch[2].toLowerCase()).setSetting(setMatch[1], setMatch[3], setMatch[4]);
    message.channel.sendMessage(`Successfully updated ${setMatch[2]}`);
  } else {
    if (commands.get(setMatch[2].toLowerCase()).setPermission(setMatch[1], setMatch[4])) {
      message.channel.sendMessage(`Successfully updated ${setMatch[2]}`);
    } else {
      message.channel.sendMessage('ERROR: Please use [ADMIN, RESTRICTED, ALL].');
    }
  }
}

function handleAdminCommands(message, guilds) {
  const cmdMatch = Aquarius.Triggers.messageTriggered(message, /^(add|remove) ([0-9]+ )?(.+)$/i);
  const roleMatch = Aquarius.Triggers.messageTriggered(message, /^create roles( [0-9]+)?$/i);
  // TODO: Expand to allow unsetting
  const setMatch = Aquarius.Triggers.messageTriggered(message,
                                                      /^set ([0-9]+ )?([\w]+) ([\w]+) (.+)$/i);

  if (cmdMatch) {
    if (guilds.length > 1 && !cmdMatch[2]) {
      message.channel.sendMessage(
        'You own multiple servers; please specify which one you mean.\n' +
        '`[add|remove] [server] [all|<command>]`');
      return;
    } else if (guilds.length > 1 && cmdMatch[2]) {
      if (!guilds.includes(cmdMatch[2])) {
        message.channel.sendMessage("You don't own that server!");
        return;
      }
    } else if (guilds.length === 1) {
      cmdMatch[2] = guilds[0].id;
    }

    handleAdminCommandChange(message, cmdMatch);
  } else if (setMatch) {
    if (guilds.length > 1 && !setMatch[1]) {
      message.channel.sendMessage(
        'You own multiple servers; please specify which one you mean.\n' +
        '`set [server] [command] [key] [value]`');
      return;
    } else if (guilds.length > 1 && setMatch[1]) {
      if (!guilds.includes(setMatch[1])) {
        message.channel.sendMessage("You don't own that server!");
        return;
      }
    } else if (guilds.length === 1) {
      setMatch[1] = guilds[0].id;
    }

    handleAdminConfigChange(message, setMatch);
  } else if (roleMatch) {
    if (guilds.length > 1 && !roleMatch[1]) {
      message.channel.sendMessage(
        'You own multiple servers; please specify which one you mean.\n' +
        '`create roles [server]`');
      return;
    } else if (guilds.length > 1 && roleMatch[1]) {
      if (!guilds.includes(roleMatch[1])) {
        message.channel.sendMessage("You don't own that server!");
        return;
      }
    } else if (guilds.length === 1) {
      roleMatch[1] = guilds[0].id;
    }

    createRoles(message, roleMatch[1]);
  } else {
    // Check for help request - if it doesn't trigger, send info
    if (!handleHelp(message, true)) {
      message.channel.sendMessage("Sorry, I didn't understand!");
    }
  }
}

function handleQuery(message) {
  // When bot responds to a query, the event triggers; prevent infinite loop
  if (message.author.bot) {
    return;
  }

  const guilds = Aquarius.Users.getOwnedGuilds(message.author);

  if (guilds.length > 0) {
    handleAdminCommands(message, guilds);
  } else {
    message.channel.sendMessage(
      'Sorry, queries are restricted to server admins.\n\n' +
      `To add the bot to your server, click here: ${Aquarius.Links.botLink()}`);
  }
}

function handleCoreCommands(message) {
  coreCommands.forEach(command => {
    const response = command.message(message);
    if (response) {
      message.channel.sendMessage(response);
    }
  });
}

function handleCommands(message) {
  commands.forEach(command => {
    if (Aquarius.Permissions.hasPermission(message.guild, message.author, command)) {
      command.message(message);
    }
  });
}

Aquarius.Client.on('message', message => {
  if (message.guild === undefined || message.guild === null) {
    handleQuery(message);
  } else {
    if (!Aquarius.Permissions.isGuildMuted(message.guild, message.author)) {
      handleHelp(message);
      handleCoreCommands(message);
      handleCommands(message);
    }
  }
});

Aquarius.Client.on('guildCreated', guild => {
  const name = Aquarius.User.name;
  let msg = '';

  msg += `**Thanks for adding ${name}!**\n`;
  msg += `I'm a discord bot with different commands you can add to your server. `;
  msg += `Please visit ${Aquarius.Links.homepageLink()} for information on how to use me.\n\n`;
  msg += `I'm also open source - if you'd like to file a bug or have a feature request, `;
  msg += `you can visit ${Aquarius.Links.repoLink()}. `;
  msg += `You can contact my creator, Ian (Desch#3091).\n\n`;

  guild.owner.sendMessage(msg);

  Aquarius.Settings.addGuild(guild.id);
  log(`Added to Guild ${guild.id}`);
});

// Start the bot!
Aquarius.Client.login(process.env.TOKEN);
Aquarius.Client.on('ready', loadCommands);
