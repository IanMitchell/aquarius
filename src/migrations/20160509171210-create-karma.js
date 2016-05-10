module.exports = {
  up: (queryInterface, Sequelize) => {
    const table = queryInterface.createTable('karmas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.STRING,
      },
      serverId: {
        type: Sequelize.STRING,
      },
      count: {
        type: Sequelize.INTEGER,
      },
      totalGiven: {
        type: Sequelize.INTEGER,
      },
      lastGiven: {
        type: Sequelize.INTEGER,
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
  down: (queryInterface) => queryInterface.dropTable('karmas'),
};
