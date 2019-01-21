import { Permissions } from 'discord.js';
import aquarius from '../..';
import { pluralize } from '../helpers/strings';
import { humanize } from '../helpers/lists';

/**
 * @typedef {import('discord.js').User} User
 * @typedef {import('discord.js').Guild} Guild
 */

const PERMISSION_NAMES = new Map([
  [Permissions.FLAGS.ADMINISTRATOR, 'Administrator'],
  [Permissions.FLAGS.CREATE_INSTANT_INVITE, 'Create Instant Invite'],
  [Permissions.FLAGS.KICK_MEMBERS, 'Kick Members'],
  [Permissions.FLAGS.BAN_MEMBERS, 'Ban Members'],
  [Permissions.FLAGS.MANAGE_CHANNELS, 'Manage Channels'],
  [Permissions.FLAGS.MANAGE_GUILD, 'Manage Server'],
  [Permissions.FLAGS.ADD_REACTIONS, 'Add Reactions'],
  [Permissions.FLAGS.VIEW_AUDIT_LOG, 'View Audit Log'],
  [Permissions.FLAGS.PRIORITY_SPEAKER, 'Priority Speaker'],
  [Permissions.FLAGS.VIEW_CHANNEL, 'View Channel'],
  [Permissions.FLAGS.SEND_MESSAGES, 'Send Messages'],
  [Permissions.FLAGS.SEND_TTS_MESSAGES, 'Send TTS Messages'],
  [Permissions.FLAGS.MANAGE_MESSAGES, 'Manage Messages'],
  [Permissions.FLAGS.EMBED_LINKS, 'Embed Links'],
  [Permissions.FLAGS.ATTACH_FILES, 'Attach Files'],
  [Permissions.FLAGS.READ_MESSAGE_HISTORY, 'Read Message History'],
  [Permissions.FLAGS.MENTION_EVERYONE, 'Mention Everyone'],
  [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, 'Use External Emojis'],
  [Permissions.FLAGS.CONNECT, 'Connect'],
  [Permissions.FLAGS.SPEAK, 'Speak'],
  [Permissions.FLAGS.MUTE_MEMBERS, 'Mute Members'],
  [Permissions.FLAGS.DEAFEN_MEMBERS, 'Deafen Members'],
  [Permissions.FLAGS.MOVE_MEMBERS, 'Move Members'],
  [Permissions.FLAGS.USE_VAD, 'Use Voice Activity'],
  [Permissions.FLAGS.CHANGE_NICKNAME, 'Change Nickname'],
  [Permissions.FLAGS.MANAGE_NICKNAMES, 'Manage Nicknames'],
  [Permissions.FLAGS.MANAGE_ROLES, 'Manage Roles'],
  [Permissions.FLAGS.MANAGE_WEBHOOKS, 'Manage Webhooks'],
  [Permissions.FLAGS.MANAGE_EMOJIS, 'Manage Emojis'],
]);

/**
 * Checks to see if a User is a bot owner
 * @param {User} user - user to check
 * @returns {boolean} Whether the user is the bot owner
 */
export function isBotOwner(user) {
  return user.id === aquarius.config.owner;
}

/**
 * Checks to see if a User is a Guild Admin or the Bot Owner
 * @param {Guild} guild - Guild to check admin status in
 * @param {User} user - User to check admin status for
 * @returns {boolean} Whether the user is a Guild Admin
 */
export function isGuildAdmin(guild, user) {
  const member = guild.member(user);

  if (!member) {
    return false;
  }

  if (isBotOwner(user)) {
    return true;
  }

  return member.hasPermission(Permissions.FLAGS.ADMINISTRATOR);
}

/**
 * Checks to see if non-Admin Users are ignored in a Guild
 * @param {Guild} guild - Guild to check ignore status in
 * @param {User} user - User to check ignore status for
 * @returns {boolean} Whether the user is ignored
 */
export function isUserIgnored(guild, user) {
  if (isGuildAdmin(guild, user)) {
    return false;
  }

  return aquarius.guildManager.get(guild.id).isUserIgnored(user.id);
}

export function getPermissionName(permission) {
  if (PERMISSION_NAMES.has(permission)) {
    return PERMISSION_NAMES.get(permission);
  }

  return 'Unknown';
}

export function check(guild, ...permissions) {
  const missingPermissions = new Set();

  permissions.forEach(permission => {
    if (!guild.me.hasPermission(permission)) {
      missingPermissions.add(permission);
    }
  });

  return {
    valid: missingPermissions.size === 0,
    missing: Array.from(missingPermissions),
  };
}

export function getRequestMessage(permissions) {
  return `I need the ${humanize(
    permissions.map(getPermissionName)
  )} ${pluralize('permission', permissions.length)} in order to do that!`;
}
