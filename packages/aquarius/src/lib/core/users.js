import aquarius from '../../aquarius';

/**
 * @typedef {import('discord.js').User} User
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
