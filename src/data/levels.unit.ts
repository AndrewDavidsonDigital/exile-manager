import { test, beforeEach, vi, assert } from 'vitest';
import { levels } from './levels';
import { _cloneDeep } from '@/lib/object';


beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});


test('Ensure that the last level\'s completionRules is empty', () => {
  const lastLevel = levels[levels.length - 1];
  assert.equal(lastLevel.completionRules.length, 0, 'Last level should have empty completionRules');
});

test('Ensure there are no orphaned levels', () => {
  // Get all level identifiers
  const allIdentifiers = new Set(levels.map(level => level._identifier));
  
  // Check each level's completionRules for valid references
  const orphanedLevels = levels.filter(level => {
    return level.completionRules.some(rule => !allIdentifiers.has(rule._identifier));
  });

  assert.equal(orphanedLevels.length, 0, 
    `Found ${orphanedLevels.length} levels with orphaned completion rules: ${orphanedLevels.map(l => l._identifier).join(', ')}`);
});

test('Ensure there are no empty encounters', () => {
  const levelsWithEmptyEncounters = levels.filter(level => {
    return level.encounters.length === 0;
  });

  assert.equal(levelsWithEmptyEncounters.length, 0,
    `Found ${levelsWithEmptyEncounters.length} levels with empty encounters: ${levelsWithEmptyEncounters.map(l => l._identifier).join(', ')}`);
});


test('Ensure all levels have unique _identifiers', () => {
  const identifiers = levels.map(level => level._identifier);
  const uniqueIdentifiers = new Set(identifiers);
  
  assert.equal(identifiers.length, uniqueIdentifiers.size,
    `Found duplicate level identifiers: ${identifiers.filter(id => 
      identifiers.indexOf(id) !== identifiers.lastIndexOf(id)
    ).join(', ')}`);
});