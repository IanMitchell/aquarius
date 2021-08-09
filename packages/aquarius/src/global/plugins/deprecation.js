import { Permissions } from 'discord.js';
import getLogger from '../../core/logging/log';

const log = getLogger('Deprecation');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'deprecation',
  hidden: true,
  description: 'Sends daily metrics about deprecated commands',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius }) => {
  // TODO: Set up a daily loop.
  /**
   * Pull value: Amount of deprecation analytics for last 24 hours
   * Post to home channel
   */
};
