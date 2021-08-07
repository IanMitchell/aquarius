const log = getLogger('eval');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'eval',
  description: 'Evaluate arbitrary code.',
  usage: '```@Aquarius eval <input>```',
};



/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^eval .+$/i, (message) => {
    message.channel.send(`https://cdn.discordapp.com/attachments/852975798255484928/873682246287114281/eval_these_nuts.mp4`);

    analytics.trackUsage('eval', message);
  });
};
