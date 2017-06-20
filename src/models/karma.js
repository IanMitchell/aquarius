module.exports = (sequelize, DataTypes) => {
  const karma = sequelize.define('karma', {
    userId: DataTypes.STRING,
    guildId: DataTypes.STRING,
    count: DataTypes.INTEGER,
    totalGiven: DataTypes.INTEGER,
    lastGiven: DataTypes.INTEGER,
    lastChanged: DataTypes.INTEGER,
  });

  return karma;
};
