const debug = require('debug');
const client = require('../core/client');
const users = require('../core/users');
const settings = require('../settings/settings');
const links = require('../helpers/links');

const log = debug('Aquarius Admin');

function addGuild(guild) {
  const name = client.user.name;
  const msg = `**Thanks for adding ${name}!**\n` +
    `I'm a discord bot with different commands you can add to your server. ` +
    `Please visit ${links.homepageLink()} for information on how to use me.\n\n` +
    `I'm also open source - if you'd like to file a bug or have a feature request, ` +
    `you can visit ${links.repoLink()}. You can contact my creator, Ian (Desch#3091).\n\n`;

  guild.owner.sendMessage(msg);

  settings.addGuild(guild.id);
  log(`Added to Guild ${guild.id}`);
}

function addCommand(message, guildId, command) {
  settings.addCommand(guildId, command.constructor.name);

  // Output alert, then configuration options
  message.channel.sendMessage(`Added ${command.name}.`).then(() => {
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

function createAquariusRoles(message, guildId) {
  const guild = client.guilds.get('id', guildId);
  const nickname = users.getNickname(guild, client.user);

  const roles = ['Mod', 'Muted'];
  let str = '';

  roles.forEach(role => {
    if (guild.roles.has('name', `${nickname} ${role}`)) {
      str += `${role} role exists!\n`;
    } else {
      client.createRole(guildId, {
        hoist: false,
        name: `${nickname} ${role}`,
        mentionable: true,
      });

      str += `${role} role created.\n`;
    }
  });

  message.author.sendMessage(str);
}

module.exports = {
  addGuild,
  addCommand,
  createAquariusRoles,
};
