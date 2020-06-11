import debug from 'debug';
import dedent from 'dedent-js';
import Minesweeper from 'discord.js-minesweeper';

const log = debug('Minesweeper');

export const info = {
  name: 'minesweeper',
  description: 'Play a game of minesweeper!',
  usage: dedent`
  **Classic Game**
  \`\`\`@Aquarius minesweeper (beginner|intermediate|expert)\`\`\`
  **Custom Game (24 mines max)**
  \`\`\`@Aquarius minesweeper custom <mines>\`\`\`
  `,
};

/**
 * We can't use the traditional numbers due to the discord message
 * character limit.
 *
 * Beginner: 9x9, 10 mines. ~0.12 ratio of bombs/squares
 * Intermediate: 16x16, 40 mines. ~0.16 ratio of bombs/squares
 * Expert: 16x30, 99 mines. ~0.21 ratio of bombs/squares
 */
const DIFFICULTIES = {
  beginner: {
    rows: 4,
    columns: 4,
    mines: 2,
  },
  intermediate: {
    rows: 8,
    columns: 8,
    mines: 10,
  },
  expert: {
    rows: 15,
    columns: 8,
    mines: 25,
  },
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(
    /^minesweeper(?: (?<difficulty>beginner|intermediate|expert))?$/i,
    (message, { groups }) => {
      log('Generating game');

      const difficulty = groups.difficulty || 'beginner';
      const { rows, columns, mines } = DIFFICULTIES[difficulty];

      const minesweeper = new Minesweeper({
        rows,
        columns,
        mines,
        revealFirstCell: true,
      });

      const game = minesweeper.start();
      message.channel.send(`**${columns}x${rows} (${mines} Mines)**\n${game}`);

      analytics.trackUsage(
        groups.difficulty ? groups.difficulty : 'default',
        message
      );
    }
  );

  aquarius.onCommand(
    /^minesweeper custom (?<count>\d{1,2})$/i,
    (message, { groups }) => {
      log(`Generating custom game with ${groups.count} bombs`);

      const mines = Math.min(groups.count, 24);

      const minesweeper = new Minesweeper({
        rows: 7,
        columns: 7,
        mines,
        revealFirstCell: true,
      });

      const game = minesweeper.start();
      message.channel.send(`**7x7 (${mines} Mines)**\n${game}`);

      analytics.trackUsage('custom', message);
    }
  );
};
