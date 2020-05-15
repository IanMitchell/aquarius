import debug from 'debug';
import dedent from 'dedent-js';

const log = debug('Roll');

export const info = {
  name: 'roll',
  description: 'Simulates a tabletop dice roll',
  usage: dedent`
    \`\`\`@Aquarius roll <dice>\`\`\`

    See this article for supported dice formats: https://wiki.roll20.net/How_to_Roll_Dice
  `,
};

function getRolls(amount, die) {
  return new Array(parseInt(amount, 10))
    .fill(0)
    .map(() => 1 + Math.floor(Math.random() * parseInt(die, 10)));
}

function getSequenceSum(sequence) {
  return sequence.rolls.reduce((a, b) => a + b, 0) + sequence.modifier;
}

function getSequenceDescription({ sign, emoji, rolls, modifier }) {
  let description = `${emoji}[`;

  if (sign) {
    description = `${sign} ${emoji}[`;
  }

  description += `${rolls.join(', ')}]`;

  if (modifier) {
    description += modifier > 0 ? ` + ${modifier}` : ` - ${modifier * -1}`;
  }

  return description;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^roll (?<roll>.*)$/i, async (message, { groups }) => {
    const { roll } = groups;

    const values = Array.from(
      roll.matchAll(
        /(?:(?<sign>[+-]) )?(?<dieCount>\d+)?d(?<dieType>[1-9]\d*)(?: ?(?<type>[+-]) ?(?<modifier>\d+(?!d)))?/gi
      )
    );

    if (values.length > 0) {
      log(`Rolling ${roll}`);

      const sequences = values.map((match) => {
        const { sign, dieCount, dieType, type, modifier } = match.groups;

        const emoji =
          dieType === '100'
            ? `${aquarius.emojiList.get('d10')}${aquarius.emojiList.get('d10')}`
            : aquarius.emojiList.get(`d${dieType}`) ?? `d${dieType}`;

        const sequence = {
          sign,
          emoji,
          rolls: getRolls(dieCount, dieType),
          modifier: null,
        };

        if (modifier) {
          let value = parseInt(modifier, 10);

          if (type === '-') {
            value *= -1;
          }

          sequence.modifier = value;
        }

        return sequence;
      });

      message.channel.send(dedent`
        **${sequences.reduce((val, sequence) => {
          if (sequence.sign === '-') {
            return val - getSequenceSum(sequence);
          }

          return val + getSequenceSum(sequence);
        }, 0)}** | ${sequences
        .map((sequence) => getSequenceDescription(sequence))
        .join(' ')}
      `);
    } else {
      message.channel.send(
        "Sorry, I don't recognize that format - if I should have, please open an issue! You can check what I support by running `.help roll`"
      );
    }

    analytics.trackUsage('roll', message);
  });
};
