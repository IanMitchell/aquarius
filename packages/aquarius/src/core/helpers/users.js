import aquarius from '../../aquarius';

/**
 * @typedef {import('discord.js').User} User
 * @typedef {import('discord.js').Guild} Guild
 */

/**
 * Gets the Discord User for Aquarius's owner
 * @returns {User} The Owner's user
 */
export async function getBotOwner() {
  return aquarius.users.fetch(aquarius.config.owner);
}
