import fetch from 'node-fetch';
import getLogger from '../../core/logging/log';

const log = getLogger('Cat');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'cat',
  description: 'Posts an image of a cat',
  usage: '```@Aquarius cat```',
};

export default async ({ aquarius }) => {
  aquarius.onCommand(/^cat$/i, async (message) => {
    log.info('Cat image request');

    try {
      const response = await fetch(
        'https://api.thecatapi.com/v1/images/search',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const json = await response.json();

      log.info(json);
      message.channel.send({ file: json[0].url });
    } catch (e) {
      log.error(e);
      message.channel.send("Sorry, I wasn't able to get an image!");
    }
  });
};
