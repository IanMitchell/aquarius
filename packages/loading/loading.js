/** @typedef {import('discord.js').TextChannel} TextChannel */

/**
 * Indicates Aquarius is loading something by using the Typing indicator
 * @param {TextChannel} channel - The Text Channel to start the typing indicator
 */
export function startLoading(channel) {
  return channel.sendTyping();
}

/**
 * Determines if the client is currently loading in a channel by using the Typing indicator
 * @param {TextChannel} channel - The Text Channel to determine typing status in
 * @returns {boolean} If the client is currently typing in the channel
 */
export function isLoading(channel) {
  return channel.typing;
}

/**
 * Determines how many loading operations the client is currently performing in a channel by using the Typing indicator
 * @param {TextChannel} channel - The Text Channel to determine typing count in
 * @returns {number} The typing count for the client
 */
export function getLoadingCount(channel) {
  return channel.typingCount;
}

/**
 * Checks to see if a function is async or not.
 * @param {function} handler - Command handler function
 * @returns {boolean} Whether the command is async or not
 */
export function isAsyncCommand(handler) {
  return handler.constructor.name === 'AsyncFunction';
}
