import { Constants } from 'discord.js';

/**
 * @typedef {import('discord.js').Constants} Constants
 */

export const ActivityTypes = Constants.ActivityTypes.reduce(
  (obj, type) => ({ ...obj, [type]: type }),
  {}
);
