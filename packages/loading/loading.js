/** @typedef {import('discord.js').TextChannel} TextChannel */

/**
 * Indicates Aquarius is loading something by using the Typing indicator
 * @param {TextChannel} channel - The Text Channel to start the typing indicator
 */
export function startLoading(channel) {
  return channel.startTyping();
}

/**
 * Indicates Aquarius has finished loading something by using the Typing indicator
 * @param {TextChannel} channel - The Text Channel to stop the typing indicator
 */
export function stopLoading(channel) {
  return channel.stopTyping();
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
