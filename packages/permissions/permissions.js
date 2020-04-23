import { Permissions } from 'discord.js';

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
 * Gets a list of Bot Admins. These should be defined as a list of comma-separated IDs in the `ADMINS` environmental variable
 * @returns {string[]} A list of global admins
 */
export function getBotAdminList() {
  if (process.env.ADMINS) {
    return process.env.ADMINS.split(',');
  }

  return [];
}

/**
 * Checks to see if a User is a bot admin
 * @param {User} user - user to check
 * @param {string[]} [admins=[]] - List of admin User IDs for the bot. Defaults to `process.env.ADMINS`
 * @returns {boolean} Whether the user is the bot admin
 */
export function isBotAdmin(user, admins = getBotAdminList()) {
  return admins.includes(user.id);
}

/**
 * Checks to see if a User is a Guild Admin
 * @param {Guild} guild - Guild to check admin status in
 * @param {User} user - User to check admin status for
 * @param {boolean} [includeBotAdmins=true] - Include the bot admins as Guild Admins
 * @returns {boolean} Whether the user is a Guild Admin
 */
export function isGuildAdmin(guild, user, includeBotAdmins = true) {
  const member = guild.member(user);

  if (!member) {
    return false;
  }

  if (includeBotAdmins && isBotAdmin(user)) {
    return true;
  }

  return member.hasPermission(Permissions.FLAGS.ADMINISTRATOR);
}

/**
 * Converts a Permission Flag to its string representation
 * @param {number} permission - Permission Flag
 * @returns {string} The name of a Permission Flag
 */
export function getPermissionName(permission) {
  if (PERMISSION_NAMES.has(permission)) {
    return PERMISSION_NAMES.get(permission);
  }

  return 'Unknown';
}

/**
 * Checks to see if the bot is granted a given list of permission flags and
 * indicates which ones it does not have
 * @param {Guild} guild - Guild to check permission values in
 * @param  {...number} permissions - Array of permission flags to check
 * @returns {Object} check - Information about the bot's permission flags in the given guild
 * @returns {boolean} check.valid - Whether the bot has all the permission flags granted
 * @returns {number[]} check.missing - Missing permission flags
 */
export function checkBotPermissions(guild, ...permissions) {
  const missingPermissions = new Set();

  permissions.forEach((permission) => {
    if (!guild.me.hasPermission(permission)) {
      missingPermissions.add(permission);
    }
  });

  return {
    valid: missingPermissions.size === 0,
    missing: Array.from(missingPermissions),
  };
}
