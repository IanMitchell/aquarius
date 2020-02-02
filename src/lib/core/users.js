import Discord from 'discord.js';
import aquarius from '../../aquarius';

// CJS / ESM compatibility
const { GuildMember } = Discord;

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
  if (!guild) {
    return user.username;
  }

  let member = user;

  if (!(member instanceof GuildMember)) {
    member = guild.member(user);
  }

  if (member.nickname) {
    return member.nickname;
  }

  return member.user.username;
}
