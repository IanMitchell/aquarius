import debug from 'debug';
import { isBot } from '../../lib/helpers/messages';

const log = debug('Games');

export const info = {
  name: 'games',
  description: 'Lists all the games members are currently playing.',
  usage: '```@Aquarius games list```',
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^games list$/i, async message => {
    log('Getting game list');

    const games = message.guild.members.reduce((list, member) => {
      const { game } = member.user.presence;

      if (!game || isBot(member.user)) {
        return list;
      }

      if (list.has(game.name)) {
        return list.set(game.name, list.get(game.name) + 1);
      }

      return list.set(game.name, 1);
    }, new Map());

    if (games.size > 0) {
      const gamesArray = Array.from(games).sort((a, b) => b[1] - a[1]);

      const response = Array.from(gamesArray).reduce(
        (str, game, i) =>
          `${str} ${i + 1}. ${game[0]} _(${game[1]} playing)_\n`,
        `**Games in ${message.guild.name}**\n\n`
      );

      message.channel.send(response);
    } else {
      message.channel.send("There aren't any games being played!");
    }

    analytics.trackUsage('list', message);
  });
};
