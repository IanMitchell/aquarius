module.exports = (sequelize, DataTypes) => {
  const quotes = sequelize.define('quote', {
    quoteId: DataTypes.INTEGER,
    guildId: DataTypes.STRING,
    channel: DataTypes.STRING,
    addedBy: DataTypes.STRING,
    quote: DataTypes.TEXT,
  });

  return quotes;
};
