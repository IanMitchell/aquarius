module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('karmas', 'lastChanged', Sequelize.INTEGER),

  down: (queryInterface) => queryInterface.removeColumn('karmas', 'lastChanged'),
};
