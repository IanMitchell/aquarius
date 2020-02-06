import { createProgressBar } from './progress-bar';

test('Progress is 0%', () => {
  expect(createProgressBar(0)).toEqual('[▱▱▱▱▱▱▱▱▱▱]');
});

test('Progress is 100%', () => {
  expect(createProgressBar(1)).toEqual('[▰▰▰▰▰▰▰▰▰▰]');
});

test('Custom character counts', () => {
  expect(createProgressBar(0.2, 20)).toEqual('[▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱]');
});

test('Percentage rounding', () => {
  expect(createProgressBar(0.35)).toEqual('[▰▰▰▰▱▱▱▱▱▱]');
});

test('Greater than 1', () => {
  expect(createProgressBar(20)).toEqual('[▰▰▱▱▱▱▱▱▱▱]');
});

test('Works with fixed width spaces', () => {
  expect(createProgressBar(0.2, 20, ' ')).toEqual('[▰▰▰▰▰▰▰▰▰▰▰▰        ]');
});
