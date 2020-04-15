import { isBot } from '@aquarius/messages';
import * as regex from '@aquarius/regex';

/** @typedef {import('discord.js').Message} Message */

/**
 * Get Aquarius's mention regex
 * @returns {RegExp} Aquarius's mention regex
 */
export function botMention(id = process.env.BOT_ID) {
  return new RegExp(`<@!?${id}>`);
}

/**
 * Check to see if a message starts with an Aquarius mention
 * @param {Message} message - the message to check
 * @returns {?RegExpMatchArray} the regex match array or null if no match
 */
export function botMentionTrigger(message, id = process.env.BOT_ID) {
  return message.content.trim().match(new RegExp(`^${botMention(id).source}`));
}

/**
 * Check to see if a message starts with `.`
 * @param {Message} message - the message to check
 * @returns {boolean} Whether the message starts with `.`
 */
export function dotTrigger(message) {
  return message.content.trim().startsWith('.');
}

/**
 * Check to see if a message starts with `!`
 * @param {Message} message - the message to check
 * @returns {boolean} Whether the message starts with `!`
 */
export function exclamationTrigger(message) {
  return message.content.trim().startsWith('!');
}

/**
 * Checks to see if a non-bot message matches a trigger
 * @param {Message} message - the message to check
 * @param {RegExp} trigger - the custom trigger to check against
 * @returns {boolean|?RegExpMatchArray} False if a bot sends the message or
 * Array/Null regex match group
 */
export function customTrigger(message, trigger) {
  if (isBot(message.author)) {
    return false;
  }

  return message.content.trim().match(trigger);
}

/**
 * Get a list of card-style matches in a non-bot message
 * (the [[Double Brackets]] syntax)
 * @param {Message} message - the message to check
 * @returns {boolean|?Array} False if the message is from a bot or
 * an Array of string matches or null if none exist
 * @todo TODO: Update return type to the regex matchAll type when typescript adds it
 */
export function bracketTrigger(message) {
  if (isBot(message.author)) {
    return false;
  }

  const matchList = Array.from(
    message.content.trim().matchAll(new RegExp(regex.BRACKET, 'g'))
  );

  if (matchList.length > 0) {
    return matchList;
  }

  return false;
}

/**
 * Looks to see if a non-bot message should trigger against a Regex by
 * examining various patterns to key off of.
 * @param {Message} message - the message to check
 * @param {RegExp} trigger - the custom trigger to check against
 * @returns {boolean|?RegExpMatchArray} False if no match or a bot sends the
 * message or an Array or null from a RegExp match group
 */
export function messageTriggered(message, trigger, id = process.env.BOT_ID) {
  // We don't respond to other bots. The "Shaun Boley" check
  if (isBot(message.author)) {
    return false;
  }

  // @aquarius trigger [message]
  if (botMentionTrigger(message, id)) {
    return message.content
      .trim()
      .replace(new RegExp(`^${regex.MENTION_USER.source} `), '')
      .match(trigger);
  }

  // .trigger [message] OR !trigger [message]
  if (dotTrigger(message, trigger) || exclamationTrigger(message, trigger)) {
    return message.content.trim().substr(1).match(trigger);
  }

  return false;
}
