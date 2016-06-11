module.exports = (sequelize, DataTypes) => {
  const setting = sequelize.define('setting', {
    serverId: DataTypes.STRING,
    config: DataTypes.JSON,
  });

  return setting;
};
