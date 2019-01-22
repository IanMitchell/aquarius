import Discord from 'discord.js';

/**
 * Check whether a message is a direct message or not
 * @param {Discord.Message} message - The message to check
 * @returns {boolean} whether the message is a direct message
 */
export function isDirectMessage(message) {
  return message.channel instanceof Discord.DMChannel;
}

/**
 * Checks to see if a user is a bot.
 * **In Test Environments, Will Always Be False**
 * @param {Discord.User} user - user to check
 * @returns {boolean} whether the user is a bot in non-test environments
 */
export function isBot(user) {
  return user.bot && process.env.NODE_ENV !== 'test';
}
