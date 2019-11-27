import {
  humanize,
  uniqueValues,
  randomValue,
  shuffle,
  setDifference,
} from '../lists';

describe('humanize', () => {
  test('Handles null arrays', () => {
    expect(humanize()).toBe('');
  });

  test('Handles empty arrays', () => {
    expect(humanize([])).toBe('');
  });

  test('Handles single item', () => {
    expect(humanize(['Space'])).toBe('Space');
  });

  test('Handles twdo items', () => {
    expect(humanize(['Space', 'Stars'])).toBe('Space and Stars');
  });

  test('Handles multiple items', () => {
    expect(humanize(['Space', 'Flight', 'Stars'])).toBe(
      'Space, Flight, and Stars'
    );
  });
});

describe('uniqueValues', () => {
  test('Removes duplicate items', () => {
    expect(uniqueValues(['Test', 'Jest', 'Test', 'Eh?'])).toEqual([
      'Test',
      'Jest',
      'Eh?',
    ]);
  });
});

describe('randomValue', () => {
  test.todo('Retrieves a random value from Array');
});

describe('shuffle', () => {
  test.todo('Changes order without losing elements');
});

describe('setDifference', () => {
  test('Calculates difference in set', () => {
    expect(
      setDifference(new Set([1, 2, 3, 4, 5, 6]), new Set([1, 3, 5]))
    ).toEqual(new Set([2, 4, 6]));
  });
});
