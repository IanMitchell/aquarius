import Discord from 'discord.js';

/**
 * Check whether a message is a one-to-one direct message or not.
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
  return user.bot;
}

/**
 * Generates a URL linking to a Discord Message
 * @param {Discord.Message} message - Message to get a link to
 * @returns {string} A URL linking to the message
 */
export function getLink(message) {
  const { guild, channel } = message;

  return `https://discordapp.com/channels/${guild.id}/${channel.id}/${message.id}`;
}
