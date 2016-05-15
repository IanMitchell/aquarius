module.exports = {
  up: (queryInterface, Sequelize) => {
    const table = queryInterface.createTable('quotes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      quoteId: {
        type: Sequelize.INTEGER,
      },
      serverId: {
        type: Sequelize.STRING,
      },
      channel: {
        type: Sequelize.STRING,
      },
      addedBy: {
        type: Sequelize.STRING,
      },
      quote: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    return table;
  },
  down: (queryInterface) => queryInterface.dropTable('quotes'),
};
