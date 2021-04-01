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
     * Adds Message context to Sentry for better error reporting.
     * @param {Message} message - Message to configure scope with
     * @param {Function} fn - Handler function to call within the configured scope
     */
    withMessageScope: (message, fn) => {
      Sentry.withScope((scope) => {
        const { tag, id } = message.author;
        scope.setUser({ username: tag, id });

        if (message.guild) {
          scope.setExtra('Guild ID', message.guild.id);
          scope.setExtra('Guild Name', message.guild.name);
          scope.setExtra('Channel ID', message.channel.id);
          scope.setExtra('Channel Name', message.channel.name);
        } else {
          scope.setExtra('Channel Type', 'DM');
        }

        scope.setExtra('Message', message.content);
        scope.setExtra('Message ID', message.id);

        try {
          fn();
        } catch (error) {
          Sentry.captureException(error);
        }
      });
    },
  };
})();
