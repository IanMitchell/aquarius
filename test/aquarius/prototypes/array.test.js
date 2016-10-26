require('../../../src/aquarius/prototypes/array');

describe('Array', () => {
  describe('#uniq', () => {
    it('Should return a unique array', () => {
      expect([].uniq()).toEqual([]);
      expect([1, 2, 3].uniq()).toEqual([1, 2, 3]);
      expect([1, 1, 2, 2, 3, 3, 4].uniq()).toEqual([1, 2, 3, 4]);
    });
  });
});
