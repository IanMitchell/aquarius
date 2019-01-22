/** @typedef {import('discord.js').TextChannel} TextChannel */

/**
 * Indicates Aquarius is loading something by using the Typing indicator
 * @param {TextChannel} channel - The Text Channel to start the typing indicator
 */
export function start(channel) {
  return channel.startTyping();
}

/**
 * Indicates Aquarius has finished loading something by using the Typing indicator
 * @param {TextChannel} channel - The Text Channel to stop the typing indicator
 */
export function stop(channel) {
  return channel.stopTyping();
}
