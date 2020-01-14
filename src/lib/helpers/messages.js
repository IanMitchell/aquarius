import Discord, { MessageMentions } from 'discord.js';
import { MENTION } from '@aquarius/regex';
import { getMentionType, MENTION_TYPES } from '@aquarius/regex/src/regex';

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

/**
 * Unfortunately discord.js doesn't order mentions by order as they appear in
 * the message but by Snowflake ID instead. Sometimes it's important to get
 * the mentions in order - this helper function will do that.
 * @param {Discord.message} message
 * @param {boolean} [repeats=false] - Include repeated mentions
 * @returns {MessageMentions[]} Ordered list of Mentions
 */
export function getOrderedMentions(message, repeats = false) {
  const mentions = Array.from(
    message.content.matchAll(new RegExp(MENTION, 'g'))
  )
    .map(mention => {
      switch (getMentionType(mention[0])) {
        case MENTION_TYPES.USER:
          return message.guild.members.get(mention.groups.id);
        case MENTION_TYPES.CHANNEL:
          return message.guild.channels.get(mention.groups.id);
        case MENTION_TYPES.ROLE:
          return message.guild.roles.get(mention.groups.id);
        default:
          return null;
      }
    })
    .filter(Boolean);

  if (repeats) {
    return mentions;
  }

  return Array.from(new Set(mentions));
}
