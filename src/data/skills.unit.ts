import { test, beforeEach, vi, expect } from 'vitest';
import { skills } from './skills';

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});

const MAX_OCCURRENCES_EXPECTED = 1;

test('Ensure there are no duplicates in our skills data', () => {
  let maxOccurence = 0;
  const reportIds= new Map<string, null>() ;

  skills.forEach( sk => {
    const newLength = skills.filter(fill => fill._identifier === sk._identifier).length;
    maxOccurence = Math.max(
      maxOccurence,
      newLength
    );
    if (newLength > MAX_OCCURRENCES_EXPECTED){
      reportIds.set(sk._identifier, null);
    }
  });

  if (maxOccurence > MAX_OCCURRENCES_EXPECTED){
    console.log(reportIds.keys());
  }

  expect(maxOccurence).toBe(MAX_OCCURRENCES_EXPECTED);
}); 

test('Ensure there are no blank Id\'s in our skills data', () => {
  const hasZeroLengthIdentifier = skills.find(el => el._identifier === '');

  expect(hasZeroLengthIdentifier).toBeUndefined();
}); 