module.exports = {
  up: (queryInterface, Sequelize) => {
    const table = queryInterface.createTable('settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      serverId: {
        type: Sequelize.STRING,
      },
      config: {
        type: Sequelize.JSON,
      },
      commands: {
        type: Sequelize.JSON,
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
  down: (queryInterface) => queryInterface.dropTable('settings'),
};
