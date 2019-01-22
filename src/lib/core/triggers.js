import aquarius from '../..';
import * as regex from '../helpers/regex';
import { isBot } from '../helpers/messages';

/** @typedef {import('discord.js').Message} Message */

/**
 * Get Aquarius's username
 * @returns {string} Aquarius's Username
 */
export function botString() {
  return aquarius.user.toString();
}

/**
 * Get Aquarius's mention regex
 * @returns {RegExp} Aquarius's mention regex
 */
export function botMention() {
  return new RegExp(`<@!?${aquarius.user.id}>`);
}

/**
 * Check to see if a message starts with an Aquarius mention
 * @param {Message} message - the message to check
 * @returns {Array|null} the regex match array or null if no match
 */
export function botMentionTrigger(message) {
  return message.content
    .trim()
    .match(new RegExp(`^${botMention().source}`));
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
 * @returns {boolean|Array|null} False if a bot sends the message or
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
 * @returns {boolean|Array|null} False if the message is from a bot or
 * an Array of string matches or null if none exist
 */
export function bracketTrigger(message) {
  if (isBot(message.author)) {
    return false;
  }

  const matchList = [];
  let match = null;

  do {
    match = regex.BRACKET.exec(message.content.trim());

    if (match) {
      matchList.push(match.groups.name);
    }
  } while (match !== null);

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
 * @returns {boolean|Array|null} False if no match or a bot sends the message
 * or an Array or null from a RegExp match group
 */
export function messageTriggered(message, trigger) {
  // We don't respond to other bots. The "Shaun Boley" check
  if (isBot(message.author)) {
    return false;
  }

  // @aquarius trigger [message]
  if (botMentionTrigger(message)) {
    return message.content.trim()
      .replace(new RegExp(`^${regex.MENTION_USER.source} `), '')
      .match(trigger);
  }

  // .trigger [message] OR !trigger [message]
  if (dotTrigger(message, trigger) || exclamationTrigger(message, trigger)) {
    return message.content.trim().substr(1).match(trigger);
  }

  return false;
}
