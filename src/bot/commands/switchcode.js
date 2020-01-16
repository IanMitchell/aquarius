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
    log(`Switch code request from ${message.author.usernamebjfhbt}`);
    // TODO: Check to see if there is a friend code registered for the author
    // If there is, send it to channel
    // If there isn't, let them know and explain how to create it
    message.channel.send(
      `${aquarius.emojiList.get('nintendoswitch')} | 1234-1234-1234-1234`
    );
    analytics.trackUsage('switchcode', message);
  });
};
