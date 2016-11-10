const Aquarius = require('../aquarius');
const Channel = Aquarius.Sequelize.import('../models/channels');

class ChannelCommand extends Aquarius.Command {
  constructor() {
    super();
    this.name = 'Channel';
    this.description = 'Allow users to join and leave a list of channels.';
    Aquarius.Client.on('channelDelete', this.removeChannel.bind(this));
  }

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += 'Normal Usage:\n';
    msg += '```';
    msg += `@${nickname} channel list\n`;
    msg += `@${nickname} channel [add|remove] [#channel]\n`;
    msg += '```';
    msg += 'Admin Usage:\n';
    msg += '```';
    msg += `@${nickname} channel [register|unregister] [#channel]\n`;
    msg += `@${nickname} channel [add|remove] [#channel] [@user]\n`;
    msg += '```';
    return msg;
  }

  removeChannel(channel) {
    if (channel.type === 'text') {
      this.log('Checking text channel deletion event');

      Channel.destroy({
        where: {
          guildId: channel.guild.id,
          channelId: channel.id,
        },
      }).then(removedRows => {
        if (removedRows > 0) {
          this.log(`Removing ${channel.name} in ${channel.guild.name}`);
          channel.guild.defaultChannel.sendMessage(`Automatically removed #${channel.name} from registered channels.`);
        } else {
          this.log('Ignoring unregistered channel');
        }
      });
    }
  }

  handleChannelRequest(msg, channelInput) {
    let targetUser = msg.author;

    // Check for Admin
    if (channelInput[3]) {
      if (Aquarius.Permissions.isGuildModerator(msg.guild, msg.author)) {
        targetUser = msg.mentions.users.array()[msg.mentions.users.array().length - 1];

        if (targetUser === undefined) {
          return;
        }
      } else {
        msg.channel.sendMessage('Only moderators can add people to channels. To use on yourself, use `.channel [add|remove] [#channel]`');
      }
    }

    // Get Channel - we can't rely on mentions since user might not be able to see it.
    const targetChannel = msg.mentions.channels.first() ||
                          msg.guild.channels.find('name', channelInput[2]);

    if (targetChannel === undefined) {
      msg.channel.sendMessage('Channel not found. To get a list, type `.channels list`.');
      return;
    }

    Channel.count({
      where: {
        guildId: msg.guild.id,
        channelId: targetChannel.id,
      },
    }).then(rows => {
      if (rows === 0) {
        msg.channel.sendMessage("That isn't a registered channel!");
        return;
      }

      if (channelInput[1] === 'add') {
        targetChannel.overwritePermissions(targetUser, {
          READ_MESSAGES: true,
          SEND_MESSAGES: true,
          EMBED_LINKS: true,
          ATTACH_FILES: true,
          READ_MESSAGE_HISTORY: true,
          MENTION_EVERYONE: true,
          EXTERNAL_EMOJIS: true,
        });

        targetChannel.sendMessage(`${targetUser} added to channel.`);
      } else {
        targetChannel.overwritePermissions(targetUser, {
          READ_MESSAGES: false,
          SEND_MESSAGES: false,
          EMBED_LINKS: false,
          ATTACH_FILES: false,
          READ_MESSAGE_HISTORY: false,
          MENTION_EVERYONE: false,
          EXTERNAL_EMOJIS: false,
        });

        targetChannel.sendMessage(`${targetUser} removed from channel.`);
      }
    });
  }

  handleChannelRegistration(msg, registerInput) {
    const targetChannel = msg.mentions.channels.first();

    if (targetChannel === undefined) {
      return;
    }

    if (registerInput[1] === 'register') {
      // Add to database
      Channel.findOrCreate({
        where: {
          guildId: msg.guild.id,
          channelId: targetChannel.id,
        },
      }).spread((channel, created) => {
        if (created) {
          this.log(`Registered ${targetChannel.name} on ${msg.guild.name}`);
          msg.channel.sendMessage(`Registered ${targetChannel}.`);
        } else {
          msg.channel.sendMessage('Channel already registered!');
        }
      });
    } else {
      // Remove from database
      Channel.destroy({
        where: {
          guildId: msg.guild.id,
          channelId: targetChannel.id,
        },
      }).then(removedRows => {
        if (removedRows > 0) {
          this.log(`Unregistered ${targetChannel.name} from ${msg.guild.name}`);
          msg.channel.sendMessage(`Unregistered ${targetChannel}.`);
        } else {
          msg.channel.sendMessage(`Could not find a registered channel named '${targetChannel}'`);
        }
      });
    }
  }

  channelList(msg) {
    this.log('Channel list request');
    Channel.findAll({
      where: {
        guildId: msg.guild.id,
      },
    }).then(response => {
      if (response.length === 0) {
        msg.channel.sendMessage('There are no channels for this server.');
      } else {
        let str = '**Channel List**\n\n';

        response.forEach(record => {
          const name = msg.guild.channels.find('id', record.channelId);
          str += `* ${name}\n`;
        });

        msg.channel.sendMessage(str);
      }
    });
  }

  message(msg) {
    const channelRegex = new RegExp(`channel (add|remove) (#[\w-]+|${Aquarius.Triggers.channelRegex})(?: (${Aquarius.Triggers.mentionRegex}))?`, 'i');
    const channelInput = Aquarius.Triggers.messageTriggered(msg, channelRegex);
    const registerRegex = new RegExp(`channel (register|unregister) (${Aquarius.Triggers.channelRegex})`, 'i');
    const registerInput = Aquarius.Triggers.messageTriggered(msg, registerRegex);

    if (channelInput) {
      this.handleChannelRequest(msg, channelInput);
    }

    if (registerInput) {
      this.handleChannelRegistration(msg, registerInput);
    }

    if (Aquarius.Triggers.messageTriggered(msg, /^channel list$/i)) {
      this.channelList(msg);
    }
  }
}

module.exports = new ChannelCommand();
