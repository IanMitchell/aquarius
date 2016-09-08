const links = require('../../../src/aquarius/helpers/links');

describe('Links', () => {
  describe('#botLink', () => {
    it('Should be correct', () => {
      expect(links.botLink()).toBe('https://discordapp.com/oauth2/authorize?client_id=185450126549057536&scope=bot&permissions=0');
    });
  });

  describe('#repoLink', () => {
    it('Should be correct', () => {
      expect(links.repoLink()).toBe('http://github.com/ianmitchell/aquarius');
    });
  });
});
