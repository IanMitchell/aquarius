/**
 * Discord Regex Helpers
 * See: https://discordapp.com/developers/docs/reference#message-formatting
 */

/**
 * Matches a generic mention. Captures the `id` of the mentioned object.
 */
export const MENTION = /<(?:(?:@[!&]?)|#)(?<id>\d+)>/i;

/**
 * Matches a mentioned User. Captures the `id` of the User.
 */
export const MENTION_USER = /<@!?(?<id>\d+)>/i;

/**
 * Matches an ID-mentioned User. Captures the `id` of the User.
 */
export const MENTION_USER_ID = /<@(?<id>\d+)>/i;

/**
 * Matches a nickname-mentioned User. Captures the `id` of the User.
 */
export const MENTION_USER_NICKNAME = /<@!(?<id>\d+)>/i;

/**
 * Matches a mentioned Channel. Captures the `id` of the Channel.
 */
export const MENTION_CHANNEL = /<#(?<id>\d+)>/i;

/**
 * Matches a mentioned Role. Captures the `id` of the Role.
 */
export const MENTION_ROLE = /<@&(?<id>\d+)>/i;

/**
 * Matches Emojis. Captures the `name` and `id` of the Emoji.
 */
export const EMOJI = /<a?:(?<name>.+):(?<id>.+):>/i;

/**
 * Matches Custom Emojis. Captures the `name` and `id` of the Emoji.
 */
export const CUSTOM_EMOJI = /<:(?<name>.+):(?<id>.+)>/i;

/**
 * Matches Animated Emojis. Captures the `name` and `id` of the Emoji.
 */
export const ANIMATED_EMOJI = /<a:(?<name>.+):(?<id>.+)>/i;

/**
 * Custom Regex Helpers
 */

/**
 * Matches [[Bracket String]] syntax. Captures the text as `name`
 */
export const BRACKET = /\[\[(?<name>.+?)\]\]/i;

/**
 * The different types of Discord mentions
 * @enum {string}
 */
export const MENTION_TYPES = {
  USER: 'user',
  CHANNEL: 'channel',
  ROLE: 'role',
};

/**
 * Determines what kind of mention it is based on the markup of the Snowflake ID
 * @param {string} mention - The mention to check. Must be the formatted block, not an ID.
 * @returns {MENTION_TYPES|null} The type of mention
 */
export function getMentionType(mention) {
  if (MENTION_USER.test(mention)) {
    return MENTION_TYPES.USER;
  }

  if (MENTION_CHANNEL.test(mention)) {
    return MENTION_TYPES.CHANNEL;
  }

  if (MENTION_ROLE.test(mention)) {
    return MENTION_TYPES.ROLE;
  }

  return null;
}
