module.exports = {
  up: (queryInterface) => {
    return queryInterface.renameColumn('karmas', 'serverId', 'guildId')
      .then(() => queryInterface.renameColumn('quotes', 'serverId', 'guildId'))
      .then(() => queryInterface.renameColumn('replies', 'serverId', 'guildId'))
      .then(() => queryInterface.renameColumn('settings', 'serverId', 'guildId'));
  },

  down: (queryInterface) => {
    return queryInterface.renameColumn('karmas', 'guildId', 'serverId')
      .then(() => queryInterface.renameColumn('quotes', 'guildId', 'serverId'))
      .then(() => queryInterface.renameColumn('replies', 'guildId', 'serverId'))
      .then(() => queryInterface.renameColumn('settings', 'guildId', 'serverId'));
  },
};
