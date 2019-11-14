import debug from 'debug';
import dedent from 'dedent-js';
import { RichEmbed } from 'discord.js';
import Sentry from '../errors/sentry';
import { getIconColor } from './colors';
import { getStandardDate } from './dates';

const log = debug('Embeds');

/**
 * @typedef {import('discord.js').Guild} Guild
 * @typedef {import('discord.js').RichEmbed} RichEmbed
 * @typedef {import('../../typedefs').EmbedField} EmbedField
 */

/**
 * Generates a RichEmbed of information for the specified Guild
 * @param {Guild} guild - The Guild to get data from
 * @param {...EmbedField} fields - A list of RichEmbed fields to add
 * @returns {RichEmbed} the RichEmbed for the Guild
 */
export async function guildEmbed(guild, ...fields) {
  const date = getStandardDate(guild.createdAt);

  const activeMembers = guild.members.filter(
    member => member.presence.status === 'online'
  );

  const channelTypes = {
    text: 0,
    voice: 0,
  };

  guild.channels.array().forEach(channel => {
    if (channel.type) {
      channelTypes[channel.type] += 1;
    }
  });

  let color = null;

  try {
    color = await getIconColor(guild.iconURL);
  } catch (error) {
    log(error);
    Sentry.captureException(error);
  }

  const embed = new RichEmbed()
    .setTitle(guild.name)
    .setThumbnail(guild.iconURL)
    .setDescription(`Created on ${date} by ${guild.owner.displayName}`)
    .setColor(color)
    .addField(
      'Channels',
      dedent`
      ${channelTypes.voice} Voice Channels
      ${channelTypes.text} Text Channels
    `,
      true
    )
    .addField(
      'Members',
      dedent`
      ${activeMembers.size} Online
      ${guild.memberCount} Total
    `,
      true
    )
    .setFooter(`Server ID: ${guild.id}`);

  fields.forEach(({ title, content }) => embed.addField(title, content));

  return embed;
}

/**
 * Generates a RichEmbed of information for the specified User
 * @param {User} user - The User to get data from
 * @param {...EmbedField} fields - A list of RichEmbed fields to add
 * @returns {RichEmbed} the RichEmbed for the User
 */
// export function userEmbed(user, ...fields) {
//   // TODO: Implement
//   return user.name;
// }
