import debug from 'debug';
import { getVanityBotLink } from '../../lib/helpers/links';

const log = debug('Invite');

export const info = {
  name: 'invite',
  description: 'Get a link to invite the bot to your server',
  usage: '```@Aquarius invite```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^invite/i, async message => {
    log(`Invite request in ${message.guild.name}`);

    message.channel.send(getVanityBotLink());
    analytics.trackUsage('invite', message);
  });
};
