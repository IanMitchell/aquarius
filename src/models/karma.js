module.exports = (sequelize, DataTypes) => {
  const karma = sequelize.define('karma', {
    userId: DataTypes.STRING,
    serverId: DataTypes.STRING,
    count: DataTypes.INTEGER,
    totalGiven: DataTypes.INTEGER,
    lastGiven: DataTypes.INTEGER,
  });

  return karma;
};
