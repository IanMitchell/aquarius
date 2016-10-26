require('../../../src/aquarius/prototypes/string');

describe('String', () => {
  describe('#capitalize', () => {
    it('Should capitalize first letter', () => {
      expect(''.capitalize()).toBe('');
      expect('.'.capitalize()).toBe('.');
      expect('this is a str'.capitalize()).toBe('This is a str');
      expect('This is a str'.capitalize()).toBe('This is a str');
      expect('this is a str. so is this'.capitalize()).toBe('This is a str. so is this');
    });
  });
});
