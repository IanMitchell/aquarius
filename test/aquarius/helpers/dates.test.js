const dates = require('../../../src/aquarius/helpers/dates');

const MS = {
  ONE_MINUTE: 1000 * 60,
  FIVE_MINUTES: 1000 * 60 * 5,
  THREE_HOURS: 1000 * 60 * 60 * 3,
  ONE_DAY: 1000 * 60 * 60 * 24,
  TWO_DAYS: 1000 * 60 * 60 * 24 * 2,
  SEVEN_YEARS: 1000 * 60 * 60 * 24 * 365 * 7,
};

describe('Dates', () => {
  describe('#exactDate', () => {
    it('Should handle edge cases', () => {
      expect(dates.exactDate(Date.now())).toBe('Now');
    });

    it('Should pluralize values correctly', () => {
      expect(dates.exactDate(Date.now() + MS.ONE_DAY + MS.ONE_MINUTE))
        .toBe('1 day 1 minute');
    });

    it('Should handle unprefixed positive dates', () => {
      expect(dates.exactDate(Date.now() + MS.FIVE_MINUTES)).toBe('5 minutes');
      expect(dates.exactDate(Date.now() + MS.THREE_HOURS)).toBe('3 hours');
      expect(dates.exactDate(Date.now() +
        MS.SEVEN_YEARS + MS.TWO_DAYS + MS.THREE_HOURS + MS.FIVE_MINUTES))
        .toBe('7 years 2 days 3 hours 5 minutes');
    });

    it('Should handle prefixed positive dates', () => {
      expect(dates.exactDate(Date.now() + MS.FIVE_MINUTES, true)).toBe('in 5 minutes');
      expect(dates.exactDate(Date.now() + MS.THREE_HOURS, true)).toBe('in 3 hours');
      expect(dates.exactDate(Date.now() +
        MS.SEVEN_YEARS + MS.TWO_DAYS + MS.THREE_HOURS + MS.FIVE_MINUTES, true))
        .toBe('in 7 years 2 days 3 hours 5 minutes');
    });

    it('Should handle unprefixed negative dates', () => {
      expect(dates.exactDate(Date.now() - MS.FIVE_MINUTES)).toBe('5 minutes');
    });

    it('Should handle prefixed negative dates', () => {
      expect(dates.exactDate(Date.now() - MS.FIVE_MINUTES, true)).toBe('5 minutes ago');
    });
  });
});
