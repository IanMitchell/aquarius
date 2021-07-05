import debug from 'debug';
import fetch from 'node-fetch';

const log = debug('Cat');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'cat',
  description: 'Posts an image of a cat',
  usage: '```@Aquarius cat```',
};

export default async ({ aquarius }) => {
  aquarius.onCommand(/^cat$/i, async (message) => {
    log('Image request');

    try {
      const response = await fetch('https://api.thecatapi.com/v1/images/search', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();

      log(json);
      message.channel.send({ file: json[0].url });
    } catch (e) {
      log(e);
      message.channel.send("Sorry, I wasn't able to get an image!");
    }
  });
};
