import Sentry from '@sentry/node';

/**
 * @typedef { import('discord.js').Message } Message
 */

export default (() => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY,
      release: process.env.GIT_HASH,
    });
  }

  return {
    ...Sentry,

    /**
     * Adds context to Sentry for better error handling.
     * @param {Message} message - Message to configure scope with
     */
    configureMessageScope: (message) => {
      Sentry.configureScope((scope) => {
        const { tag, id } = message.author;
        scope.setUser({ username: tag, id });

        if (message.guild) {
          scope.setExtra('Guild ID', message.guild.id);
          scope.setExtra('Channel ID', message.channel.id);
        } else {
          scope.setExtra('Channel Type', 'DM');
        }

        scope.setExtra('Message', message.content);
        scope.setExtra('Message ID', message.id);
      });
    },
  };
})();
