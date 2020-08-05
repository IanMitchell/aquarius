import debug from 'debug';
import dedent from 'dedent-js';
import { MessageEmbed } from 'discord.js';
import parseColor from 'parse-color';
import { getEmbedColorFromHex } from '../../core/helpers/colors';

const log = debug('Color');

export const info = {
  name: 'color',
  description: 'Lookup information about a color.',
  usage: dedent`
    \`\`\`@Aquarius color <name>\`\`\`
    Name can be one of the following formats:
    * #hex
    * keyword
    * hsl(x, y, z)
    * rgba(w, x, y, z)
  `,
};

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^color (?<name>.+)$/i, (message, { groups }) => {
    log(`Looking up color ${groups.name}`);

    let color;

    // Check for hex without the # sign
    if (
      (groups.name.length === 3 || groups.name.length === 6) &&
      !groups.name.startsWith('#')
    ) {
      color = parseColor(`#${groups.name}`);
    } else {
      color = parseColor(groups.name);
    }

    if (!color.hex) {
      message.channel.send(
        "Sorry, I wasn't able to parse that color! I only can lookup colors formatted as a `#0A0A0A` hex, a `rebeccapurple` keyword, in `hsl(50, 210, 50)` hsl format, or in `rgba(15,53,242,30%)` rgba format."
      );
    } else {
      const embed = new MessageEmbed()
        .setTitle(groups.name)
        .setThumbnail(
          `http://singlecolorimage.com/get/${color.hex.substring(1)}/350x350`
        )
        .setColor(getEmbedColorFromHex(color.hex))
        .addField('Keyword', color.keyword ?? 'N/A', true)
        .addField('Hex', color.hex, true)
        .addField('CMYK', color.cmyk.join(', '), true)
        .addField('HSL', color.hsl.join(', '), true)
        .addField('HSV', color.hsv.join(', '), true)
        .addField('RGB', color.rgb.join(', '), true);

      message.channel.send(embed);
    }

    analytics.trackUsage('color', message);
  });
};
