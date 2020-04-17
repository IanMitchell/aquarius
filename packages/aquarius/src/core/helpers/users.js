import aquarius from '../../aquarius';

/**
 * @typedef {import('discord.js').User} User
 * @typedef {import('discord.js').Guild} Guild
 */

/**
 * Get an array of guilds Aquarius is in that are owned for a user
 * @param {User} user - User to return owned guilds for
 * @return {Guild[]} Array of Guilds
 */
export function getOwnedGuilds(user) {
  return aquarius.guilds.cache.filter((guild) => guild.owner === user).array();
}

/**
 * Gets the Discord User for Aquarius's owner
 * @returns {User} The Owner's user
 */
export async function getBotOwner() {
  return aquarius.users.fetch(aquarius.config.owner);
}
