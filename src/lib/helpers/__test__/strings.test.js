import { capitalize } from '../strings';

describe('capitalize', () => {
  test('Capitalizes first character in string', () => {
    expect(capitalize('TEST')).toBe('TEST');
    expect(capitalize('test')).toBe('Test');
    expect(capitalize('Test')).toBe('Test');
    expect(capitalize('! warning !')).toBe('! warning !');
  });
});
