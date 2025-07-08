import { test, expect, beforeAll, vi } from 'vitest';
import { calculateScaledExperience, baseDamageFunction, DIFFICULTY_SETTINGS } from '@/lib/core';
import { useGameEngine } from '@/stores/game';
import { generateItemLevel, generateGoldWithBias } from '@/lib/itemUtils';
import { calculateDodgeChance, calculateDeflectionAttempts, calculateCriticalChance } from '@/lib/combatMechanics';
import { createPinia, setActivePinia } from 'pinia';
import { ExileClass } from '@/lib/core';

// Mock the logging module to disable trace logging
vi.mock('@/lib/logging', () => ({
  trace: vi.fn(), // Mock trace to do nothing
  debug: vi.fn(), // Mock debug to do nothing
  _testing: {
    initLogging: vi.fn(),
    setConfig: vi.fn()
  }
}));

// Set up Pinia before tests
beforeAll(() => {
  const pinia = createPinia();
  setActivePinia(pinia);
});

// Test experience scaling for levels 1-10
test('Experience scaling for levels 1-10', () => {
  const baseExp = 100;
  const testLevels = Array.from({ length: 10 }, (_, i) => i + 1);
  
  testLevels.forEach(charLevel => {
    // Test same level
    const sameLevelExp = calculateScaledExperience(baseExp, charLevel, charLevel);
    expect(sameLevelExp).toBe(baseExp);
    
    // Test one level below (only if not level 1)
    if (charLevel > 1) {
      const belowLevelExp = calculateScaledExperience(baseExp, charLevel, charLevel - 1);
      expect(belowLevelExp).toBe(Math.floor(baseExp * (1 + (-1 * 0.4)))); // 40% decrease per level
    }
    
    // Test one level above
    const aboveLevelExp = calculateScaledExperience(baseExp, charLevel, charLevel + 1);
    expect(aboveLevelExp).toBe(Math.floor(baseExp * (1 + (1 * 0.2)))); // 20% increase per level
  });
});

// Test experience scaling for every 5 levels from 10 to 100
test('Experience scaling for levels 10-100 (every 5 levels)', () => {
  const baseExp = 100;
  const testLevels = Array.from({ length: 19 }, (_, i) => (i + 2) * 5); // 10, 15, 20, ..., 100
  
  testLevels.forEach(charLevel => {
    // Test same level
    const sameLevelExp = calculateScaledExperience(baseExp, charLevel, charLevel);
    expect(sameLevelExp).toBe(baseExp);
    
    // Test 5 levels below (only if not at minimum level)
    if (charLevel > 5) {
      const belowLevelExp = calculateScaledExperience(baseExp, charLevel, charLevel - 5);
      expect(belowLevelExp).toBe(Math.floor(baseExp * Math.max(0.1, 1 + (-5 * 0.4)))); // 40% decrease per level
    }
    
    // Test 5 levels above
    const aboveLevelExp = calculateScaledExperience(baseExp, charLevel, charLevel + 5);
    expect(aboveLevelExp).toBe(Math.floor(baseExp * (1 + (5 * 0.2)))); // 20% increase per level
  });
});

// Test minimum scaling factor
test('Experience scaling minimum factor', () => {
  const baseExp = 100;
  const charLevel = 80;
  
  // Test with a very low area level (should hit minimum scaling)
  const veryLowLevelExp = calculateScaledExperience(baseExp, charLevel, charLevel - 50);
  expect(veryLowLevelExp).toBe(Math.floor(baseExp * 0.1));
});

// Test maximum scaling factor
test('Experience scaling maximum factor', () => {
  const baseExp = 100;
  const charLevel = 80;
  
  // Test with a very high area level (should hit minimum scaling)
  const veryHighLevelExp = calculateScaledExperience(baseExp, charLevel, charLevel + 50);
  expect(veryHighLevelExp).toBe(Math.floor(baseExp * 0.1));
});

// Level Up Rewards Tests
test('Level up rewards distribution', () => {
  const game = useGameEngine();
  const testLevels = Array.from({ length: 20 }, (_, i) => i + 1);
  
  testLevels.forEach(level => {
    // Create a mock character
    const mockCharacter = {
      level,
      pendingRewards: {
        skills: 0,
        passives: 0,
        stats: 0
      },
      stats: {
        health: 100,
        currentHealth: 100,
        mana: 100,
        currentMana: 100,
        fortune: 10,
        fortitude: 10,
        wrath: 10,
        affinity: 10
      },
      class: ExileClass.SPELLSWORD,
      name: 'Test Character',
      experience: 0,
      gold: 0,
      skills: [],
      passives: [],
      temporalEffects: [],
      equipment: {},
      loot: [],
      cooldowns: [],
      refreshes: 0,
    };
    
    // Initialize game with mock character
    game.init(mockCharacter);
    
    // Simulate level up
    game.levelUp();
    
    // Verify rewards based on level
    const leveledUp = game.character?.level || 0;
    if (leveledUp === 2) {
      expect(game.character?.pendingRewards.passives).toBeGreaterThan(0);
    } else if (leveledUp % 4 === 1) {
      expect(game.character?.pendingRewards.skills).toBeGreaterThan(0);
    } else if (leveledUp % 3 === 1 && leveledUp !== 3) {
      expect(game.character?.pendingRewards.passives).toBeGreaterThan(0);
    } else if (leveledUp % 4 !== 1 && leveledUp % 3 !== 1) {
      expect(game.character?.pendingRewards.stats).toBeGreaterThan(0);
    }
  });
});

// Area Level Scaling Tests
test('Encounter generation scaling', () => {
  const testAreaLevels = [1, 10, 20, 30, 40, 50];
  
  testAreaLevels.forEach(areaLevel => {
    const game = useGameEngine();
    
    // Create a mock character with baseline fortune (10)
    const mockCharacter = {
      level: areaLevel,
      stats: {
        fortune: 10, // Baseline fortune
        health: 100,
        currentHealth: 100,
        mana: 100,
        currentMana: 100,
        fortitude: 10,
        wrath: 10,
        affinity: 10
      },
      class: ExileClass.SPELLSWORD,
      name: 'Test Character',
      experience: 0,
      gold: 0,
      skills: [],
      passives: [],
      temporalEffects: [],
      equipment: {},
      loot: [],
      cooldowns: [],
      pendingRewards: {
        skills: 0,
        passives: 0,
        stats: 0
      },
      refreshes: 0,
    };
    
    // Initialize game with mock character
    game.init(mockCharacter);
    
    // Add loot with baseline amount
    const baseAmount = 10;
    game.addLoot(baseAmount, areaLevel, 1, false);
    
    // Verify loot generation scales with area level
    if (game.character?.loot) {
      // With baseline fortune (10), we should get exactly baseAmount items
      expect(game.character.loot.length, `Expected ${baseAmount} items at area level ${areaLevel}, got ${game.character.loot.length}`).toBe(baseAmount);

      const minRange = areaLevel - 3;
      const maxRange = areaLevel + 4;
      
      // Count items within ±2 of area level
      const itemsInRange = game.character.loot.filter(item => 
        item.iLvl >= minRange && item.iLvl <= maxRange
      ).length;
      
      // With std dev of 1, about 95% of items should be within ±2 of area level
      // For 10 items, we expect at least 8 to be in range
      expect(itemsInRange, `At area level ${areaLevel}, expected at least 8 items within ±2 levels, got ${itemsInRange} items. Item levels: ${game.character.loot.map(item => item.iLvl).join(', ')}`).toBeGreaterThanOrEqual(8);
      
      // All items should be within ±3 of area level (99.7% of normal distribution)
      // Note: areaLevel is incremented by 1 in processEncounter, so we adjust bounds
      game.character.loot.forEach((item, index) => {
        expect(item.iLvl, `Item ${index + 1} at area level ${areaLevel} has invalid level ${item.iLvl}. Expected between ${minRange} and ${maxRange}`).toBeGreaterThanOrEqual(minRange);
        expect(item.iLvl, `Item ${index + 1} at area level ${areaLevel} has invalid level ${item.iLvl}. Expected between ${minRange} and ${maxRange}`).toBeLessThanOrEqual(maxRange);
      });
    } else {
      throw new Error(`No loot generated for area level ${areaLevel}`);
    }
  });
});

// Item Level Scaling Tests
test('Item level distribution', () => {
  const testAreaLevels = [1, 10, 20, 30, 40, 50];
  const sampleSize = 1000;

  testAreaLevels.forEach(areaLevel => {
    const itemLevels = Array.from({ length: sampleSize }, () => 
      generateItemLevel(areaLevel)
    );
    
    // Calculate mean and standard deviation
    const mean = itemLevels.reduce((a, b) => a + b, 0) / sampleSize;
    const stdDev = Math.sqrt(
      itemLevels.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sampleSize
    );
    
    // Mean should be close to area level (allowing for more variance)
    expect(Math.abs(mean - areaLevel)).toBeLessThan(1.0);

    // Standard deviation should be close to 1
    expect(Math.abs(stdDev - 1)).toBeLessThan(0.3);

  });
});

// Combat Mechanics Scaling Tests
test('Dodge chance scaling', () => {
  const testLevels = [1, 20, 40, 60, 80, 100];
  const testEvasion = [40, 200, 400, 600, 800, 1000];
  
  testLevels.forEach((level, index) => {
    const dodgeChance = calculateDodgeChance(testEvasion[index], level);
    
    // Verify dodge chance is between 0 and 100 (percentage)
    expect(dodgeChance).toBeGreaterThanOrEqual(0);
    expect(dodgeChance).toBeLessThanOrEqual(100);
    
    // Verify dodge chance increases with evasion at the same level
    if (index > 0) {
      const prevDodgeChance = calculateDodgeChance(testEvasion[index - 1], level);
      expect(dodgeChance).toBeGreaterThanOrEqual(prevDodgeChance);
    }
  });
});

test('Armor mitigation scaling', () => {
  const testLevels = [1, 10, 20, 30, 40, 50];
  const testArmor = [10, 50, 100, 150, 200, 250];
  
  testLevels.forEach((level, index) => {
    const deflectionAttempts = calculateDeflectionAttempts(testArmor[index], level);
    
    // Verify deflection attempts increase with armor
    if (index > 0) {
      expect(deflectionAttempts).toBeGreaterThanOrEqual(
        calculateDeflectionAttempts(testArmor[index - 1], level)
      );
    }
  });
});

// Loot Generation Scaling Tests
test('Fortune stat scaling', () => {
  const game = useGameEngine();
  const testFortuneValues = [-40, -20, 0, 20, 40]; // Adjusted to be relative to baseline of 10
  const baseLootAmount = 10;
  
  testFortuneValues.forEach(fortune => {
    // Create a complete mock character with the test fortune value
    const mockCharacter = {
      level: 50,
      stats: {
        fortune: fortune + 10, // Add baseline fortune of 10
        health: 100,
        currentHealth: 100,
        mana: 100,
        currentMana: 100,
        fortitude: 10,
        wrath: 10,
        affinity: 10
      },
      class: ExileClass.SPELLSWORD,
      name: 'Test Character',
      experience: 0,
      gold: 0,
      skills: [],
      passives: [],
      temporalEffects: [],
      equipment: {},
      loot: [],
      cooldowns: [],
      pendingRewards: {
        skills: 0,
        passives: 0,
        stats: 0
      },
      refreshes: 0,
    };
    
    // Initialize game with mock character
    game.init(mockCharacter);
    
    // Add loot and verify scaling
    game.addLoot(baseLootAmount, 50, 1, false);
    
    if (game.character?.loot) {
      const lootCount = game.character.loot.length;
      
      // Verify loot count scales with fortune
      if (fortune > 0) {
        expect(lootCount).toBeGreaterThan(baseLootAmount);
      } else if (fortune < 0) {
        expect(lootCount).toBeLessThan(baseLootAmount);
      } else {
        expect(lootCount).toBe(baseLootAmount);
      }
    }
  });
});

// Gold Generation Tests
test('Currency bias scaling', () => {
  const game = useGameEngine();
  const baseGold = 100;
  
  // Create a mock character with baseline fortune
  const mockCharacter = {
    level: 50,
    stats: {
      fortune: 10, // Baseline fortune
      health: 100,
      currentHealth: 100,
      mana: 100,
      currentMana: 100,
      fortitude: 10,
      wrath: 10,
      affinity: 10
    },
    class: ExileClass.SPELLSWORD,
    name: 'Test Character',
    experience: 0,
    gold: 0, // Start with 0 gold
    skills: [],
    passives: [],
    temporalEffects: [],
    equipment: {},
    loot: [],
    cooldowns: [],
    pendingRewards: {
      skills: 0,
      passives: 0,
      stats: 0
    },
    refreshes: 0,
  };
  
  // Initialize game with mock character
  game.init(mockCharacter);
  
  // Generate gold with currency bias
  const goldWithBias = generateGoldWithBias(baseGold, ['currency']);
  
  // Update character's gold
  game.updateGold(goldWithBias);
  
  // Verify gold multiplier is applied (should be between 1.2x and 2x of base gold)
  if (game.character) {
    expect(game.character.gold).toBeGreaterThan(baseGold * 1.2);
    expect(game.character.gold).toBeLessThanOrEqual(baseGold * 2);
  }
});

// Critical Strike Chance Tests
test('Critical strike chance scaling', () => {
  // Test base critical chance (5%)
  const baseCrit = calculateCriticalChance(0);
  expect(baseCrit).toBe(5); // 5% base chance

  // Test with various affix bonuses
  const testCases = [
    { bonus: 0.2, expected: 6 },    // +20% = 6% total
    { bonus: 1.0, expected: 10 },   // +100% = 10% total
    { bonus: 5.0, expected: 30 },   // +500% = 30% total (capped)
    { bonus: 10.0, expected: 30 },  // +1000% = 30% total (capped)
  ];

  testCases.forEach(({ bonus, expected }) => {
    const critChance = calculateCriticalChance(bonus);
    expect(critChance).toBe(expected);
  });
});

// Base Damage Function Tests
test('Base damage function scaling', () => {
  // Test with minimum multipliers
  const minDamage = baseDamageFunction(1, 1, 1);
  expect(minDamage).toBeGreaterThanOrEqual(5);
  expect(minDamage).toBeLessThanOrEqual(15);

  // Define mob tiers
  const mobTiers = [
    ['basic', 1.0] as const,
    ['elite', 2.5] as const,
    ['boss', 5] as const
  ];

  // Test with various multipliers using actual difficulty settings and mob tiers
  const testCases = mobTiers.flatMap(tier => [
    { 
      area: 2, 
      tier: tier[1], 
      difficulty: DIFFICULTY_SETTINGS.get('Easy')?.dangerMultiplier || 1, 
      min: Math.floor(5 * 2 * tier[1] * 0.5), 
      max: Math.floor(15 * 2 * tier[1] * 0.5),
      _description: `Easy ${tier[0]} mob in area 2`
    },
    { 
      area: 1, 
      tier: tier[1], 
      difficulty: DIFFICULTY_SETTINGS.get('Normal')?.dangerMultiplier || 1, 
      min: Math.floor(5 * 1 * tier[1] * 1), 
      max: Math.floor(15 * 1 * tier[1] * 1),
      _description: `Normal ${tier[0]} mob in area 1`
    },
    { 
      area: 1, 
      tier: tier[1], 
      difficulty: DIFFICULTY_SETTINGS.get('Hard')?.dangerMultiplier || 1, 
      min: Math.floor(5 * 1 * tier[1] * 2), 
      max: Math.floor(15 * 1 * tier[1] * 2),
      _description: `Hard ${tier[0]} mob in area 1`
    }
  ]);

  testCases.forEach(({ area, tier, difficulty, min, max }) => {
    const damage = baseDamageFunction(area, tier, difficulty);
    expect(damage).toBeGreaterThanOrEqual(min);
    expect(damage).toBeLessThanOrEqual(max);
  });

  // Test with high multipliers to ensure proper scaling
  const highDamage = baseDamageFunction(5, 5, DIFFICULTY_SETTINGS.get('Hard')?.dangerMultiplier || 1);
  expect(highDamage).toBeGreaterThanOrEqual(Math.floor(5 * 5 * 5 * 2));
  expect(highDamage).toBeLessThanOrEqual(Math.floor(15 * 5 * 5 * 2));
});