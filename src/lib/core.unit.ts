import { test, beforeEach, vi } from 'vitest';
import { fail } from 'assert';

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});


test('Ensure that there is no import statement in core.ts', () => {
  fail();
});