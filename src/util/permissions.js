const config = require('../../config');

const isBotOwner = (user) => user.id === config.botOwnerId;

module.exports = {
  isBotOwner,
};
