const formatters = require('../../../src/aquarius/helpers/formatters');

describe('Formatters', () => {
  describe('#formatBytes', () => {
    it('Should be correct', () => {
      expect(formatters.formatBytes(0)).toBe('0 B');
      expect(formatters.formatBytes(93)).toBe('93 B');
      expect(formatters.formatBytes(1000)).toBe('1 kB');
      expect(formatters.formatBytes(1000, true)).toBe('1000 B');
      expect(formatters.formatBytes(1024, true)).toBe('1 kB');
      expect(formatters.formatBytes(102400)).toBe('102.4 kB');
      expect(formatters.formatBytes(102400, true)).toBe('100 kB');
      expect(formatters.formatBytes(9030000)).toBe('9.03 MB');
      expect(formatters.formatBytes(1000000000)).toBe('1 GB');
      expect(formatters.formatBytes(1234567890000)).toBe('1.23 TB');
      expect(formatters.formatBytes('123')).toBe('0 B');
    });
  });
});
