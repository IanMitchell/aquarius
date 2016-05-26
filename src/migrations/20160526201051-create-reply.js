module.exports = {
  up: (queryInterface, Sequelize) => {
    const table = queryInterface.createTable('replies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      serverId: {
        type: Sequelize.STRING,
      },
      trigger: {
        type: Sequelize.STRING,
      },
      response: {
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
  down: (queryInterface) => queryInterface.dropTable('replies'),
};
