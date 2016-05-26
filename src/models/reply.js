module.exports = (sequelize, DataTypes) => {
  const replies = sequelize.define('reply', {
    serverId: DataTypes.STRING,
    trigger: DataTypes.STRING,
    response: DataTypes.TEXT,
  });

  return replies;
};
