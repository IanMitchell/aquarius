import * as Sentry from '@sentry/node';

export default (() => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY,
      release: process.env.GIT_HASH,
    });
  }

  return {
    ...Sentry,
    configureMessageScope: message => {
      Sentry.configureScope(scope => {
        const { username, id } = message.author;
        scope.setUser({ username, id });

        if (message.guild) {
          scope.setExtra('Guild ID', message.guild.id);
          scope.setExtra('Channel ID', message.channel.id);
        } else {
          scope.setExtra('Channel Type', 'DM');
        }

        scope.setExtra('Message ID', message.id);
      });
    },
  };
})();
