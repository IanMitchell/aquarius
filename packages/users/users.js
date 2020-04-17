import { Constants, GuildMember } from 'discord.js';

/**
 * @typedef {import('discord.js').User} User
 * @typedef {import('discord.js').Guild} Guild
 */

/**
 * Gets a User's nickname or username for a Guild
 * @param {Guild} guild - The Guild to get a User's nickname in
 * @param {User} user - The User to get the nickname for
 * @returns {string} The User's Nickname or Username if not set
 */
export function getNickname(guild, user) {
  if (!guild) {
    return user.username;
  }

  let member = user;

  if (!(member instanceof GuildMember)) {
    member = guild.member(user);
  }

  if (member.nickname) {
    return member.nickname;
  }

  return member.user.username;
}

/**
 * Checks to see if a user is a bot.
 * @param {User} user - user to check
 * @returns {boolean} whether the user is a bot in non-test environments
 */
export function isBot(user) {
  if (process.env.BOT_IGNORE) {
    return false;
  }

  return user.bot;
}

export function isStreaming(presence) {
  return presence.activities.some(
    (activity) => activity.type === Constants.ActivityTypes.STREAMING
  );
}
