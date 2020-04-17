import Sentry from '@aquarius/sentry';
import debug from 'debug';
import dedent from 'dedent-js';
import Discord from 'discord.js';
import { getIconColor } from './colors';
import { getStandardDate } from './dates';

// CJS / ESM compatibility
const { MessageEmbed } = Discord;

const log = debug('Embeds');

/**
 * @typedef {import('discord.js').Guild} Guild
 * @typedef {import('discord.js').MessageEmbed} MessageEmbed
 * @typedef {import('../../typedefs').EmbedField} EmbedField
 */

/**
 * Generates a MessageEmbed of information for the specified Guild
 * @param {Guild} guild - The Guild to get data from
 * @param {...EmbedField} fields - A list of MessageEmbed fields to add
 * @returns {MessageEmbed} the MessageEmbed for the Guild
 */
export async function guildEmbed(guild, ...fields) {
  const date = getStandardDate(guild.createdAt);

  const activeMembers = guild.members.filter(
    (member) => member.presence.status === 'online'
  );

  const channelTypes = {
    text: 0,
    voice: 0,
  };

  guild.channels.cache.array().forEach((channel) => {
    if (channel.type) {
      channelTypes[channel.type] += 1;
    }
  });

  let color = 0x333333;

  try {
    if (guild.iconURL()) {
      color = await getIconColor(guild.iconURL());
    }
  } catch (error) {
    log(error);
    Sentry.captureException(error);
  }

  const embed = new MessageEmbed()
    .setTitle(guild.name)
    .setThumbnail(guild.iconURL())
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
