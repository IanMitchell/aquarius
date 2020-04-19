import { startLoading, stopLoading } from '@aquarius/loading';
import Sentry from '@aquarius/sentry';
import debug from 'debug';
import dedent from 'dedent-js';
import fetch from 'node-fetch';

const log = debug('Strawpoll');

// TODO: Check docopt on this
export const info = {
  name: 'strawpoll',
  description: 'Creates a strawpoll',
  usage: dedent`
    To create a poll:
    \`\`\`@Aquarius strawpoll <title> | <options>;...\`\`\`

    To create a poll where a user can vote for multiple items:
    \`\`\`@Aquarius strawpoll multiple <title> | <options>;...\`\`\`

    Polls can have between 2 and 30 options. Use a semicolon as a delimiter (to use a semicolon in a poll option you can escape it with a backslash).

    Example:
    \`\`\`@Aquarius strawpoll My Poll | first option; second option; this is a third choice!\`\`\`
  `,
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(
    /^strawpoll(?: (?<multiple>multiple))? (?<title>.*) \| (?<input>.*)$/i,
    async (message, { groups }) => {
      log('Creating strawpoll');
      const options = groups.input
        .split(/(?<!\\);/)
        .map((value) => value.trim().replace(/\\;/g, ';'))
        .filter(Boolean);

      if (options.length < 2 || options.length > 30) {
        message.channel.send(
          'You can only have between 2 and 30 options for a poll!'
        );
        return;
      }

      try {
        startLoading(message.channel);
        const response = await fetch('https://www.strawpoll.me/api/v2/polls', {
          method: 'post',
          body: JSON.stringify({
            title: groups.title.trim(),
            options,
            multi: Boolean(groups.multiple),
          }),
        });

        const json = await response.json();
        message.channel.send(`:bar_chart: | https://strawpoll.me/${json.id}`);
      } catch (error) {
        Sentry.captureException(error);
        message.channel.send('Sorry, something went wrong!');
      } finally {
        stopLoading(message.channel);
      }

      analytics.trackUsage('strawpoll', message);
    }
  );
};
