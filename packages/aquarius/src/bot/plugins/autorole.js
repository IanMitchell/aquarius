// import debug from 'debug';
// import { Permissions } from 'discord.js';

// const log = debug('Autorole');

/** @type {import('../../typedefs').CommandInfo} */
export const info = {
  name: 'autorole',
  description: 'Allows members to sign up for roles via message reactions.',
  // permissions: [Permissions.FLAGS.ADD_REACTIONS],
  disabled: true,
};

/** @type {import('../../typedefs').Command} */
export default async () => {
  // // TODO: Listen for Reactions
  // aquarius.on('messageReactionAdd', async messageReaction => {
  //   const { message } = messageReaction;
  //   log(message.author.id);
  // });
  // // TODO: Listen for post creation
  // aquarius.onCommand();
};
