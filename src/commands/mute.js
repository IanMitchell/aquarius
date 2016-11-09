const Aquarius = require('../aquarius');

const DEFAULT_TIMEOUT = 5;

class Mute extends Aquarius.Command {
  constructor() {
    super();
    this.description = 'Mute a member for a period of time';
    this.settings.addKey('timeout',
                         DEFAULT_TIMEOUT,
                         'Duration in minutes before a user is unmuted (Min: 1m). Bot requires Admin permissions to use.');
  }

  helpMessage(nickname) {
    let msg = super.helpMessage();

    msg += 'Usage:\n';
    msg += '```';
    msg += `@${nickname} mute [@user]\n`;
    msg += `@${nickname} unmute [@user]\n`;
    msg += '```';
    return msg;
  }

  getTimeout(guild) {
    let val = parseInt(this.getSetting(guild.id, 'timeout'), 10);

    if (isNaN(val)) {
      val = DEFAULT_TIMEOUT;
    }

    val = Math.max(1, val);

    return 1000 * 60 * val;
  }

  createMask(guild) {
    return Aquarius.Users.getNickname(guild, Aquarius.Client.user).then(nickname => {
      return guild.createRole({ name: `${nickname}:Muted` }).then(role => {
        guild.channels.array().forEach(channel => {
          channel.overwritePermissions(role, {
            SEND_MESSAGES: false,
            SEND_TTS_MESSAGES: false,
            MANAGE_MESSAGES: false,
            EMBED_LINKS: false,
            ATTACH_FILES: false,
            MENTION_EVERYONE: false,
            EXTERNAL_EMOJIS: false,
            SPEAK: false,
            MUTE_MEMBERS: false,
            DEAFEN_MEMBERS: false,
            MOVE_MEMBERS: false,
            USE_VAD: true,
            CHANGE_NICKNAME: false,
            MANAGE_NICKNAMES: false,
            MANAGE_ROLES_OR_PERMISSIONS: false,
          });
        });

        this.log(`Created role ${role.name} on ${guild.name}`);
      });
    });
  }

  unmuteMember(guild, member) {
    Aquarius.Users.getNickname(guild, Aquarius.Client.user).then(nickname => {
      const role = guild.roles.find('name', `${nickname}:Muted`);
      member.removeRole(role);
      member.setMute(false);
      this.log(`Unmuted ${member.user.username}`);
    });
  }

  muteMember(guild, member) {
    Aquarius.Users.getNickname(guild, Aquarius.Client.user).then(nickname => {
      const muteTimeout = this.getTimeout(guild);
      const role = guild.roles.find('name', `${nickname}:Muted`);
      member.addRole(role);
      member.setMute(true);

      this.log(`Muted ${member.user.username}`);

      setTimeout(() => this.unmuteMember(guild, member), muteTimeout);
    });
  }

  message(msg) {
    if (Aquarius.Permissions.isGuildModerator(msg.channel.guild, msg.author)) {
      const muteRegex = new RegExp(`^mute ${Aquarius.Triggers.mentionRegex}$`, 'i');
      const unmuteRegex = new RegExp(`^unmute ${Aquarius.Triggers.mentionRegex}$`, 'i');

      if (Aquarius.Triggers.messageTriggered(msg, unmuteRegex)) {
        const user = msg.mentions.users.array()[msg.mentions.users.array().length - 1];

        if (user === undefined) {
          return;
        }

        this.log(`Unmute request on ${user.username} by ${msg.author.username}`);
        const member = msg.guild.members.find('id', user.id);
        this.unmuteMember(msg.guild, member);
        msg.channel.sendMessage(`Unmuted ${member.nickname}`);
      }

      if (Aquarius.Triggers.messageTriggered(msg, muteRegex)) {
        const user = msg.mentions.users.array()[msg.mentions.users.array().length - 1];

        if (user === undefined) {
          return;
        }

        this.log(`Mute request on ${user.username} by ${msg.author.username}`);

        const muteTimeout = this.getTimeout(msg.guild);

        Aquarius.Users.getNickname(msg.guild, Aquarius.Client.user).then(nickname => {
          const member = msg.guild.members.find('id', user.id);

          if (!msg.guild.roles.exists('name', `${nickname}:Muted`)) {
            this.createMask(msg.guild).then(() => this.muteMember(msg.guild, member));
          } else {
            this.muteMember(msg.guild, member);
          }

          Aquarius.Users.getNickname(msg.guild, member.user).then(nick => {
            msg.channel.sendMessage(`Muted ${nick} for ${muteTimeout / (1000 * 60)} minutes.`);
          });
        });
      }
    }
  }
}

module.exports = new Mute();
