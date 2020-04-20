import {
  getPermissionName,
  isBotAdmin,
  isGuildAdmin,
} from '@aquarius-bot/permissions';
import pluralize from 'pluralize';
import aquarius from '../../aquarius';
import { humanize } from './lists';

/**
 * @typedef {import('discord.js').User} User
 * @typedef {import('discord.js').Guild} Guild
 */

/**
 * Checks to see if a User is a bot owner
 * @param {User} user - user to check
 * @returns {boolean} Whether the user is the bot owner
 */
export function isBotOwner(user) {
  return isBotAdmin(user, [aquarius.config.owner]);
}

/**
 * Checks to see if non-Admin Users are ignored in a Guild
 * @param {Guild} guild - Guild to check ignore status in
 * @param {User} user - User to check ignore status for
 * @returns {boolean} Whether the user is ignored
 */
export function isUserIgnored(guild, user) {
  if (isGuildAdmin(guild, user, true)) {
    return false;
  }

  return aquarius.guildManager.get(guild.id).isUserIgnored(user.id);
}

/**
 * Tages a list of permission flags and generates a message requesting
 * the permissions be granted
 * @param {number[]} permissions - array of permission flags
 * @returns {string} Request message for the given permission flags
 */
export function getRequestMessage(permissions) {
  return `I need the ${humanize(
    permissions.map(getPermissionName).sort()
  )} ${pluralize('permission', permissions.length)} in order to do that!`;
}
