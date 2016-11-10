module.exports = (sequelize, DataTypes) => {
  const channels = sequelize.define('channels', {
    channelId: DataTypes.STRING,
    guildId: DataTypes.STRING,
  });

  return channels;
};
