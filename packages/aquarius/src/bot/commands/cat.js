import { startLoading, stopLoading } from '@aquarius/loading';
import debug from 'debug';
import fetch from 'node-fetch';

const log = debug('Cat');

// TODO: Implement and Test
export const info = {
  name: 'cat',
  description: 'Posts an image of a cat',
  usage: '```@Aquarius cat```',
  disabled: true, // API Issues
};

export default async ({ aquarius }) => {
  aquarius.onCommand(/^cat$/i, async message => {
    log('Image request');
    startLoading(message.channel);

    try {
      // TODO: Switch to thecatapi? This one takes forever and times out
      const response = await fetch('http://aws.random.cat/meow', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();

      log(json);
      message.channel.send({ file: json.file });
    } catch (e) {
      log(e);
      message.channel.send("Sorry, I wasn't able to get an image!");
    }

    stopLoading(message.channel);
  });
};
