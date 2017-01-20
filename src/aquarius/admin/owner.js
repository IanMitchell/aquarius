function isBotOwner(user) {
  return user.id === process.env.OWNER_ID;
}

module.exports = isBotOwner;
