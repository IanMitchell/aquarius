module.exports = (sequelize, DataTypes) => {
  const quotes = sequelize.define('quote', {
    quoteId: DataTypes.INTEGER,
    serverId: DataTypes.STRING,
    channel: DataTypes.STRING,
    addedBy: DataTypes.STRING,
    quote: DataTypes.TEXT,
  });

  return quotes;
};
