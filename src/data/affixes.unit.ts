import { test, beforeEach, vi, expect } from 'vitest';
import { allAffixes } from './affixes';
import { _cloneDeep } from '@/lib/object';
import type { IAffix } from '@/lib/affixTypes';


beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});


test('Ensure there are no duplicate id\'s in our affixes data', () => {
  const affixIds = allAffixes.map(e => e.id); // grab all id's

  // Find duplicates
  const duplicates = affixIds.filter((id, index) => affixIds.indexOf(id) !== index);
  const uniqueDuplicates = [...new Set(duplicates)];

  if (uniqueDuplicates.length > 0) {
    throw new Error(`Found ${uniqueDuplicates.length} duplicate affix IDs:\n${uniqueDuplicates.join('\n')}`);
  }

  const uniqueAffixIds = [...new Set(affixIds)]; // enforce uniqueness by set
  expect(affixIds.length).toEqual(uniqueAffixIds.length);
});

test('Ensure there maxILevel if defined is always greater than minILevel if defined', () => {
  // Filter affixes that have both minILevel and maxILevel defined
  const affixesWithLevels = allAffixes.filter(affix => 
    affix.minILevel !== undefined && affix.maxILevel !== undefined
  );

  // Collect all violations
  const violations = affixesWithLevels.filter(affix => {
    const minLevel = affix.minILevel as number;
    const maxLevel = affix.maxILevel as number;
    return maxLevel <= minLevel;
  });

  // If we found any violations, create a detailed error message
  if (violations.length > 0) {
    const errorMessage = violations.map(affix => 
      `Affix "${affix.name}" (${affix.id}): minILevel=${affix.minILevel}, maxILevel=${affix.maxILevel}`
    ).join('\n');
    
    throw new Error(`Found ${violations.length} affixes where maxILevel is not greater than minILevel:\n${errorMessage}`);
  }
}); 

test('Ensure there affix names are unique within affix slot', () => {
  // Group affixes by their type and category
  const affixGroups = new Map<string, IAffix[]>();
  
  allAffixes.forEach(affix => {
    const key = `${affix.type}_${affix.category}`;
    if (!affixGroups.has(key)) {
      affixGroups.set(key, []);
    }
    affixGroups.get(key)?.push(affix);
  });

  // Check each group for duplicate names
  const violations: { slot: string; duplicates: string[] }[] = [];
  
  affixGroups.forEach((affixes, slot) => {
    const names = affixes.map(a => a.name);
    const uniqueNames = [...new Set(names)];
    
    if (names.length !== uniqueNames.length) {
      // Find the duplicates
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
      violations.push({
        slot,
        duplicates: [...new Set(duplicates)]
      });
    }
  });

  // If we found any violations, create a detailed error message
  if (violations.length > 0) {
    const errorMessage = violations.map(v => 
      `Slot "${v.slot}" has duplicate names: ${v.duplicates.join(', ')}`
    ).join('\n');
    
    throw new Error(`Found ${violations.length} affix slots with duplicate names:\n${errorMessage}`);
  }
}); 
