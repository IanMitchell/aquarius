// TODO: Document entire file

// From Lea Verou
function escapedPattern(str) {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function escapedRegExp(flags, strings, ...values) {
  const pattern =
    strings[0] +
    values.map((v, i) => escapedPattern(v) + strings[i + 1]).join('');

  return RegExp(pattern, flags);
}

export const regexp = new Proxy(escapedRegExp.bind(undefined, ''), {
  get: (t, property) => escapedRegExp.bind(undefined, property),
});

/**
 * Discord Regex Helpers
 * See: https://discordapp.com/developers/docs/reference#message-formatting
 */

export const MENTION = /<(?:(?:@[!&]?)|#)(?<id>\d+)>/i;
export const MENTION_USER = /<@!?(?<id>\d+)>/i;
export const MENTION_USER_ID = /<@(?<id>\d+)>/i;
export const MENTION_USER_NICK = /<@!(?<id>\d+)>/i;
export const MENTION_CHANNEL = /<#(?<id>\d+)>/i;
export const MENTION_ROLE = /<@&(?<id>\d+)>/i;

export const EMOJI = /<a?:(?<name>.+):(?<id>.+):>/i;
export const EMOJI_CUSTOM = /<:(?<name>.+):(?<id>.+):>/i;
export const EMOJI_CUSTOM_ANIMATED = /<a:(?<name>.+):(?<id>.+):>/i;

/**
 * Custom Regex Helpers
 */

/** Matches the `[[Card Name]]` syntax */
export const BRACKET = /\[\[(?<name>.+?)\]\]/gi;
