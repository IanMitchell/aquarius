const pkg = require('../../../package');

function botLink() {
  const url = `https://discordapp.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}`;
  return `${url}&scope=bot&permissions=0`;
}

function repoLink() {
  return `http://github.com/${pkg.repository}`;
}

module.exports = {
  botLink,
  repoLink,
};
