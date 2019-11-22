import {
  ONE_SECOND,
  ONE_MINUTE,
  FIVE_MINUTES,
  TEN_MINUTES,
  THIRTY_MINUTES,
  ONE_HOUR,
  ONE_DAY,
  ONE_WEEK,
  getDateAgo,
  getDateIn,
} from '../times';

describe('Constants', () => {
  test('Constants should not change', () => {
    expect({
      '1s': ONE_SECOND,
      '1m': ONE_MINUTE,
      '5m': FIVE_MINUTES,
      '10m': TEN_MINUTES,
      '30m': THIRTY_MINUTES,
      '1h': ONE_HOUR,
      '1d': ONE_DAY,
      '1w': ONE_WEEK,
    }).toMatchInlineSnapshot(`
      Object {
        "10m": 600000,
        "1d": 86400000,
        "1h": 3600000,
        "1m": 60000,
        "1s": 1000,
        "1w": 604800000,
        "30m": 1800000,
        "5m": 300000,
      }
    `);
  });
});

describe('getDateAgo', () => {
  test.todo('Date is in the past');
});

describe('getDateIn', () => {
  test.todo('Date is in the future');
});
