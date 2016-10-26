const Sequelize = require('sequelize');
module.exports = new Sequelize(process.env.DATABASE_URL, {
  logging: require('../dashboard/database'),
});
