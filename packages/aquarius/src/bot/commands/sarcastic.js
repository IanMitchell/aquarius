import getLogger, { getMessageMeta } from '../../core/logging/log';

const log = getLogger('Sarcastic');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'sarcastic',
  description: 'Makes input text sarcastic.',
  usage: '```@Aquarius sarcastic <input>```',
};

function sarcastic(str) {
  return Array.from(str)
    .map((char, i) => char[`to${i % 2 ? 'Upper' : 'Lower'}Case`]())
    .join('');
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // TODO: Switch to slash command
  aquarius.onCommand(/^sarcastic (?<string>.+)$/i, (message, { groups }) => {
    log.info('Sarcastic request', getMessageMeta(message));
    message.channel.send(
      `${sarcastic(groups.string)} ${aquarius.emojiList.get('spongebob')}`
    );
    analytics.trackUsage('sarcastic', message);
  });
};
