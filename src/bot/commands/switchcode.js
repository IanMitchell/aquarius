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

    const service = await aquarius.services.getLink(
      message.author,
      'Nintendo Switch'
    );

    if (!service) {
      message.channel.send(
        "It doesn't look like you've linked your Nintendo Switch code with me yet! Send me a DM saying `services add` to get started."
      );
    } else {
      message.channel.send(
        `${aquarius.emojiList.get('nintendoswitch')} | ${
          service['Friend Code']
        }`
      );
    }
    analytics.trackUsage('switchcode', message);
  });
};
