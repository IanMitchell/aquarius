import debug from 'debug';

const log = debug('Switch Code');

export const info = {
  name: 'switchcode',
  description: 'Nintendo Switch Friend Code lookup helper.',
  usage: '```@Aquarius switchcode```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^switchcode$/i, async message => {
    log(`Switch code request from ${message.author.username}`);

    if (!(await aquarius.services.has(message.author, 'Nintendo Switch'))) {
      message.channel.send(
        "It doesn't look like you've linked your Nintendo Switch code with me yet! Send me a DM saying `link` to get started."
      );
    } else {
      const code = await aquarius.services.get(
        message.author,
        'Nintendo Switch'
      );
      message.channel.send(
        `${aquarius.emojiList.get('nintendoswitch')} | ${code['Friend Code']}`
      );
    }
    analytics.trackUsage('switchcode', message);
  });
};
