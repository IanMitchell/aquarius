import getLogger from '../../core/logging/log';

const log = getLogger('Dog');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'dog',
  description: 'Posts an image of a dog',
  usage: '```@Aquarius dog```',
};

// TODO: Switch to slash command
export default async ({ aquarius, analytics }) => {};
