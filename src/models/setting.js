module.exports = (sequelize, DataTypes) => {
  const setting = sequelize.define('setting', {
    guildId: DataTypes.STRING,
    config: DataTypes.JSON,
    commands: DataTypes.JSON,
  });

  return setting;
};
