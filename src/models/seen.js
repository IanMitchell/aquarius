module.exports = (sequelize, DataTypes) => {
  const seen = sequelize.define('seen', {
    userId: DataTypes.STRING,
    lastSeen: DataTypes.INTEGER,
  });

  return seen;
};
