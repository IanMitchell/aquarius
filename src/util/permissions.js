const isBotOwner = (user) => user.id === process.env.OWNER_ID;

module.exports = {
  isBotOwner,
};
