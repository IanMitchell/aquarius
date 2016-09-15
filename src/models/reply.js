module.exports = (sequelize, DataTypes) => {
  const replies = sequelize.define('reply', {
    guildId: DataTypes.STRING,
    trigger: DataTypes.STRING,
    response: DataTypes.TEXT,
  });

  return replies;
};
