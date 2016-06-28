module.exports = (sequelize, DataTypes) => {
  const setting = sequelize.define('setting', {
    serverId: DataTypes.STRING,
    config: DataTypes.JSON,
    commands: DataTypes.JSON,
  });

  return setting;
};
