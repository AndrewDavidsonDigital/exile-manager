import { test, beforeEach, vi, expect } from 'vitest';
import { passives } from './passives';

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});

const MAX_OCCURRENCES_EXPECTED = 1;

test('Ensure there are no duplicates in our passives data', () => {
  let maxOccurence = 0;
  const reportIds= new Map<string, null>() ;

  passives.forEach( pa => {
    const newLength = passives.filter(fill => fill._identifier === pa._identifier).length;
    maxOccurence = Math.max(
      maxOccurence,
      newLength
    );
    if (newLength > MAX_OCCURRENCES_EXPECTED){
      reportIds.set(pa._identifier, null);
    }
  });

  if (maxOccurence > MAX_OCCURRENCES_EXPECTED){
    console.log(reportIds.keys());
  }

  expect(maxOccurence).toBe(MAX_OCCURRENCES_EXPECTED);
}); 

test('Ensure there are no blank Id\'s in our passives data', () => {
  const hasZeroLengthIdentifier = passives.find(el => el._identifier === '');

  expect(hasZeroLengthIdentifier).toBeUndefined();
}); 