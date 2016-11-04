const Sequelize = require('sequelize');
const dashboard = require('../dashboard/dashboard');

if (dashboard.isEnabled()) {
  module.exports = new Sequelize(process.env.DATABASE_URL, {
    logging: require('../dashboard/database'),
  });
} else {
  module.exports = new Sequelize(process.env.DATABASE_URL);
}
