const mentions = require('./mentions');

const client = {
  user: {
    mention: () => mentions.botMention(),
  },
};

module.exports = {
  client,
};
