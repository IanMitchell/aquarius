import { checkBotPermissions } from '@aquarius-bot/permissions';
import Sentry from '@aquarius-bot/sentry';
import debug from 'debug';
import { MessageEmbed, Permissions } from 'discord.js';
import fetch from 'node-fetch';
import xmldom from 'xmldom';
import { capitalize } from '../../core/helpers/strings';

// CJS / ESM compatibility
const { DOMParser } = xmldom;

const log = debug('Define');
const API = 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml';

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'define',
  description: 'Provides the definition for a word',
  permissions: [Permissions.FLAGS.EMBED_LINKS],
  usage: '```@Aquarius define <word>```',
};

function getDefinition(dom) {
  const list = dom.getElementsByTagName('def')[0];
  return Array.from(list.getElementsByTagName('dt'))
    .map((el) => `${el.textContent}\n`)
    .join('');
}

function getPlural(dom) {
  const list = dom.getElementsByTagName('in');

  if (list.length > 0) {
    return Array.from(list[0].getElementsByTagName('if'))
      .map((el) => `**${el.textContent}**`)
      .join(' _or_ ');
  }

  return 'None';
}

function getPronunciation(dom) {
  return dom.getElementsByTagName('pr')[0].textContent;
}

function isWord(dom) {
  if (dom.getElementsByTagName('suggestion').length > 0) {
    return false;
  }

  return true;
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  // TODO: Switch to slash command
  aquarius.onCommand(/^define (?<word>.+)$/i, async (message, { groups }) => {
    const check = checkBotPermissions(message.guild, ...info.permissions);

    if (!check.valid) {
      log('Invalid permissions');
      message.channel.send(
        aquarius.permissions.getRequestMessage(check.missing)
      );
      return;
    }

    try {
      log(`Querying for '${groups.word}'`);
      const auth = `key=${process.env.DICTIONARY_API_KEY}`;
      const response = await fetch(`${API}/${groups.word}?${auth}`);
      const xml = await response.text();

      const parser = new DOMParser();
      const dom = parser.parseFromString(xml, 'text/xml');

      if (isWord(dom)) {
        const embed = new MessageEmbed()
          .setTitle(capitalize(dom.getElementsByTagName('ew')[0].textContent))
          .setColor(0x0074d9)
          .setFooter('Definitions provided by Merriam Webster')
          .addField('Definition', getDefinition(dom))
          .addField('Plural', getPlural(dom))
          .addField('Pronunciation', getPronunciation(dom));

        message.channel.send(embed);
      } else {
        const words = Array.from(dom.getElementsByTagName('suggestion'))
          .map((element) => element.textContent)
          .join(', ');

        message.channel.send(
          `Sorry, that isn't a word I'm familiar with. Did you mean any of these? \n\n${words}`
        );
      }

      analytics.trackUsage('define', message);
    } catch (error) {
      log(error);
      Sentry.captureException(error);
    }
  });
};
