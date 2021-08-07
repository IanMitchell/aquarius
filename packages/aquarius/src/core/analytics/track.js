import database from '../database/database';
import getLogger from '../logging/log';

const log = getLogger('Analytics');

/**
 * Creates a event record in the Analytics table. Automatically associates a date with the action
 * @param {string} category - Broad overview for the area you're tracking
 * @param {string} label - More specific area of the area you're tracking
 * @param {string} action - Specific action of the area you're tracking
 * @param {Object} context - Additional fields you want to associate with the record
 */
export default async function track(category, label, action, context) {
  log.info(`Tracking ${category}>${label}>${action}`);

  return database.analytic.create({
    data: {
      category,
      label,
      action,
      context,
    },
  });
}

/**
 * Extracts important fields from a Message
 * @param {import('discord.js').Message} message - Message to get context for
 * @returns {Object} context data to associate with analytic event
 */
export function getMessageContext(message) {
  const context = {};

  if (message?.guild) {
    context.guildId = message.guild.id;
  }

  if (message?.channel) {
    context.channelId = message.channel.id;
  }

  if (message?.author) {
    context.userId = message.author.id;
  }

  if (message?.content) {
    context.content = message.content;
  }

  return context;
}

/**
 * Extracts important fields from an Interaction
 * @param {import('discord.js').Interaction} interaction - Interaction to get context for
 * @returns {Object} context data to associate with analytic event
 */
export function getInteractionContext(interaction) {
  const context = {};

  if (interaction?.guild) {
    context.guildId = interaction?.guild.id;
  }

  if (interaction?.channel) {
    context.channelId = interaction.channel.id;
  }

  if (interaction?.author) {
    context.userId = interaction.author.id;
  }

  if (interaction?.content) {
    context.content = interaction.content;
  }

  return context;
}
