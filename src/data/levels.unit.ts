import { test, beforeEach, vi } from 'vitest';
import { levels } from './levels';
import { _cloneDeep } from '@/lib/object';
import { fail } from 'assert';


beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});


test('Ensure there are no duplicate id\'s in our affixes data', () => {
  fail();
});
