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
