import { GuildMember } from 'discord.js';
import aquarius from '../../aquarius';

/**
 * @typedef {import('discord.js').User} User
 * @typedef {import('discord.js').Guild} Guild
 * @typedef {import('discord.js').Collection} Collection
 */

/**
 * Get a collection of guilds Aquarius is in that are owned for a user
 * @param {User} user - User to return owned guilds for
 * @return {Collection} Collection of guilds
 */
export function getOwnedGuilds(user) {
  return aquarius.guilds.findAll('owner', user);
}

/**
 * Gets the Discord User for Aquarius's owner
 * @returns {User} The Owner's user
 */
export async function getBotOwner() {
  return aquarius.fetchUser(aquarius.config.owner);
}
/**
 * Gets a User's nickname or username for a Guild
 * @param {Guild} guild - The Guild to get a User's nickname in
 * @param {User} user - The User to get the nickname for
 * @returns {string} The User's Nickname or Username if not set
 */
export function getNickname(guild, user) {
  let member = user;

  if (!(member instanceof GuildMember)) {
    member = guild.member(user);
  }

  if (member.nickname) {
    return member.nickname;
  }

  return member.user.username;
}

/**
 * Checks to see if a User has a Role in a Guild
 * @param {Guild} guild - The Guild to check the User in
 * @param {User} user - The User to check
 * @param {string} roleName - The name of the role to check for
 * @returns {boolean} Whether the User has the role or not
 */
export function hasRole(guild, user, roleName) {
  const member = guild.member(user);

  if (!member) {
    return false;
  }

  return member.roles.exists('name', roleName);
}
