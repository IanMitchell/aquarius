import { startLoading, stopLoading } from '@aquarius-bot/loading';
import debug from 'debug';
import { Permissions } from 'discord.js';
import JSZip from 'jszip';
import fetch from 'node-fetch';

const log = debug('Emojis');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'emojis',
  description: 'Creates a zip file with all server emojis',
  permissions: [Permissions.FLAGS.ATTACH_FILES],
  usage: '```@Aquarius emojis download```',
};

async function downloadImage(url) {
  const response = await fetch(url);
  const data = await response.buffer();
  return data.toString('base64');
}

/** @type {import('../../typedefs').Command} */
export default async ({ aquarius, analytics }) => {
  aquarius.onCommand(/^emojis download$/i, async (message) => {
    try {
      log('Creating emoji zip file for download');
      startLoading(message.channel);

      const zip = new JSZip();

      await Promise.all(
        message.guild.emojis.cache.map(async (emoji) =>
          downloadImage(emoji.url).then((data) =>
            zip.file(`${emoji.name}.${emoji.animated ? 'gif' : 'png'}`, data, {
              base64: true,
            })
          )
        )
      );

      const folder = await zip.generateAsync({ type: 'nodebuffer' });

      message.channel.send({
        files: [
          {
            attachment: folder,
            name: 'emojis.zip',
          },
        ],
      });

      analytics.trackUsage('download', message);
    } catch (error) {
      log(error);
    } finally {
      stopLoading(message.channel);
    }
  });
};
