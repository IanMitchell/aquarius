import dedent from 'dedent-js';
import morse from 'morse';
import getLogger from '../../core/logging/log';

const log = getLogger('Morse');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'morse',
  description: 'Encode or decode morse code.',
  usage: dedent`
  To encode a message:
  \`\`\`@Aquarius morse encode <message>\`\`\`
  To decode a message:
  \`\`\`@Aquarius morse decode <message>\`\`\`
  `,
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // TODO: Switch to slash command
  aquarius.onCommand(/^morse encode (?<input>.+)$/i, (message, { groups }) => {
    log.info(`Encoding "${groups.input}"`);
    const str = morse.encode(groups.input);
    message.channel.send(str);
    analytics.trackUsage('enocde', message);
  });

  // TODO: Switch to slash command
  aquarius.onCommand(/^morse decode (?<input>.+)$/i, (message, { groups }) => {
    log.info(`Decoding "${groups.input}"`);
    const str = morse.decode(groups.input);
    message.channel.send(str);
    analytics.trackUsage('decode', message);
  });
};
