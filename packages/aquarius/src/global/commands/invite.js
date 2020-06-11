import debug from 'debug';
import { getVanityBotLink } from '../../core/helpers/links';

const log = debug('Invite');

export const info = {
  name: 'invite',
  description: 'Get a link to add me to your server',
  usage: '```@Aquarius invite```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^invite/i, (message) => {
    log(`Invite request in ${message.guild.name}`);

    message.channel.send(getVanityBotLink());
    analytics.trackUsage('invite', message);
  });
};
