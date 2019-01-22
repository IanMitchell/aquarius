/**
 * @jest-environment node
 */

import TriggerMap from '../trigger-map';

describe('TriggerMap', () => {
  test('remembers current command', () => {
    const triggerMap = new TriggerMap();
    triggerMap.setCurrentCommand('present');
    triggerMap.onTrigger('key');

    expect(triggerMap.get('key')).toBe('present');
  });
});
