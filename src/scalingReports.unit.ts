import { test, vi } from 'vitest';
import { calculateScaledExperience } from '@/lib/core';
import { calculateDodgeChance, calculateDeflectionAttempts } from '@/lib/combatMechanics';

// Mock the logging module to disable trace logging
vi.mock('@/lib/logging', () => ({
  trace: vi.fn(),
  debug: vi.fn(),
  _testing: {
    initLogging: vi.fn(),
    setConfig: vi.fn()
  }
}));

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

// Visual representation of experience scaling
test('Generate experience scaling table', () => {
  const baseExp = 100;
  const charLevels = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const areaLevels = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  
  // Calculate column widths
  const numberColumnWidth = 7;
  const headerLevelNumberPadding = 3;
  const areaLevelColumnDisplayWidth = 7;
  
  // Calculate total width for the separator and centering titles
  const totalWidth = areaLevelColumnDisplayWidth + (charLevels.length * numberColumnWidth);
  
  // Print header
  console.log('\n' + colors.bold + 'Experience Scaling Table (Base XP: 100)'.padStart(totalWidth / 2 + 20) + colors.reset);
  console.log(colors.blue + 'Char Level →'.padStart(totalWidth / 2 + 10) + colors.reset);
  console.log(colors.blue + 'Area Level ↓'.padStart(totalWidth / 2 + 10) + colors.reset);
  
  // Print column headers
  let header = ' '.repeat(areaLevelColumnDisplayWidth);
  charLevels.forEach(level => {
    const levelHeader = `L${level.toString().padStart(headerLevelNumberPadding)}`;
    header += levelHeader.padStart(numberColumnWidth);
  });
  console.log(colors.bold + header + colors.reset);
  
  // Print separator
  console.log('-'.repeat(totalWidth));
  
  // Print each row
  areaLevels.forEach(areaLevel => {
    let row = colors.bold + `L${areaLevel.toString().padStart(headerLevelNumberPadding)} | ` + colors.reset;
    charLevels.forEach(charLevel => {
      const scaledExp = calculateScaledExperience(baseExp, charLevel, areaLevel);
      let color = colors.reset;
      
      if (areaLevel > charLevel) {
        color = colors.green;
      } else if (areaLevel < charLevel) {
        color = colors.red;
      } else {
        color = colors.yellow;
      }
      
      row += color + `${scaledExp.toString().padStart(numberColumnWidth)}` + colors.reset;
    });
    console.log(row);
  });
});

// Visual representation of item level distribution
test('Generate item level distribution table', () => {
  const areaLevels = [1, 10, 20, 30, 40, 50];
  const sampleSize = 1000;
  const barChartWidth = 50; // Max width of the bar chart

  // Simplified item level generation function
  const generateSimpleItemLevel = (areaLevel: number): number => {
    // Generate a random number with normal distribution around areaLevel
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return Math.max(1, Math.min(100, Math.round(areaLevel + z0)));
  };

  console.log('\n' + colors.bold + 'Item Level Distribution (1000 samples per area level)'.padStart(60) + colors.reset);
  console.log(colors.blue + 'Area Level →'.padStart(30) + colors.reset);
  console.log('-'.repeat(80));

  areaLevels.forEach(areaLevel => {
    const itemLevels = Array.from({ length: sampleSize }, () => generateSimpleItemLevel(areaLevel));

    const minDisplayLevel = Math.max(1, areaLevel - 5);
    const maxDisplayLevel = Math.min(100, areaLevel + 5);

    const counts: { [key: number]: number } = {};
    for (let i = minDisplayLevel; i <= maxDisplayLevel; i++) {
      counts[i] = 0;
    }

    itemLevels.forEach(level => {
      if (level >= minDisplayLevel && level <= maxDisplayLevel) {
        counts[level]++;
      }
    });

    const maxCount = Math.max(...Object.values(counts));
    const scaleFactor = maxCount > 0 ? barChartWidth / maxCount : 0;

    console.log(colors.bold + `Area Level ${areaLevel} (Min: ${minDisplayLevel}, Max: ${maxDisplayLevel}):` + colors.reset);
    console.log(`Each '*' represents approx. ${Math.ceil(maxCount / barChartWidth)} items.`);
    console.log('------------------------------------------------------------------------------');

    for (let i = minDisplayLevel; i <= maxDisplayLevel; i++) {
      const count = counts[i] || 0;
      const bar = colors.blue + '*'.repeat(Math.round(count * scaleFactor)) + colors.reset;
      console.log(`L${i.toString().padStart(3)} | ${bar} ${count}`);
    }
    console.log('-'.repeat(80));
  });
});

// Visual representation of dodge chance scaling
test('Generate dodge chance scaling table', () => {
  const levels = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const evasionValues = [
    5, 10, 15, 20, 30, 40, 50, 70, 90, 100, 150,
    ...Array.from({ length: (700 - 200) / 50 + 1 }, (_, i) => 200 + i * 200)
  ];
  
  // Calculate column widths (similar to experience table)
  const numberColumnWidth = 8; // For values like '100.0%'
  const headerLevelNumberPadding = 3; // For '  1', ' 10', '100' in 'LXX'
  const evasionColumnDisplayWidth = 8; // For 'EXXXX | ' (E1000 is 5 chars, ' | ' is 3 chars)
  
  // Calculate total width for the separator and centering titles
  const totalWidth = evasionColumnDisplayWidth + (levels.length * numberColumnWidth);

  console.log('\n' + colors.bold + 'Dodge Chance Scaling'.padStart(totalWidth / 2 + 10) + colors.reset);
  console.log(colors.blue + 'Level →'.padStart(totalWidth / 2 + 5) + colors.reset);
  console.log(colors.blue + 'Evasion ↓'.padStart(totalWidth / 2 + 5) + colors.reset);

  // Print column headers
  let header = ' '.repeat(evasionColumnDisplayWidth);
  levels.forEach(level => {
    const levelHeader = `L${level.toString().padStart(headerLevelNumberPadding)}`;
    header += levelHeader.padStart(numberColumnWidth);
  });
  console.log(colors.bold + header + colors.reset);
  
  // Print separator
  console.log('-'.repeat(totalWidth));

  evasionValues.forEach(evasion => {
    let row = colors.bold + `E${evasion.toString().padStart(6)} | ` + colors.reset;
    
    levels.forEach(level => {
      const dodgeChance = calculateDodgeChance(evasion, level);
      let color = colors.reset;
      
      if (dodgeChance > 75) {
        color = colors.green;
      } else if (dodgeChance > 50) {
        color = colors.yellow;
      } else if (dodgeChance > 25) {
        color = colors.blue;
      } else {
        color = colors.red;
      }
      
      row += color + `${dodgeChance.toFixed(1)}%`.padStart(numberColumnWidth) + colors.reset;
    });
    
    console.log(row);
  });
});

// Visual representation of armor mitigation scaling
test('Generate armor mitigation scaling table', () => {
  const levels = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const armorValues = [
    5, 10, 15, 20, 30, 40,
    ...Array.from({ length: (1000 - 50) / 50 + 1 }, (_, i) => 50 + i * 50)
  ];
  
  // Calculate column widths (similar to experience table)
  const numberColumnWidth = 8; // For values like '10.0'
  const headerLevelNumberPadding = 3; // For '  1', ' 10', '100' in 'LXX'
  const armorColumnDisplayWidth = 8; // For 'AXXXX | ' (A250 is 4 chars, ' | ' is 3 chars)
  
  // Calculate total width for the separator and centering titles
  const totalWidth = armorColumnDisplayWidth + (levels.length * numberColumnWidth);

  console.log('\n' + colors.bold + 'Armor Mitigation Scaling'.padStart(totalWidth / 2 + 10) + colors.reset);
  console.log(colors.blue + 'Level →'.padStart(totalWidth / 2 + 5) + colors.reset);
  console.log(colors.blue + 'Armor ↓'.padStart(totalWidth / 2 + 5) + colors.reset);

  // Print column headers
  let header = ' '.repeat(armorColumnDisplayWidth);
  levels.forEach(level => {
    const levelHeader = `L${level.toString().padStart(headerLevelNumberPadding)}`;
    header += levelHeader.padStart(numberColumnWidth);
  });
  console.log(colors.bold + header + colors.reset);

  // Print separator
  console.log('-'.repeat(totalWidth));
  
  armorValues.forEach(armor => {
    let row = colors.bold + `A${armor.toString().padStart(4)} | ` + colors.reset;
    
    levels.forEach(level => {
      const deflectionAttempts = calculateDeflectionAttempts(armor, level);
      let color = colors.reset;
      
      if (deflectionAttempts > 3) {
        color = colors.green;
      } else if (deflectionAttempts > 2) {
        color = colors.yellow;
      } else if (deflectionAttempts > 1) {
        color = colors.blue;
      } else {
        color = colors.red;
      }
      
      row += color + `${deflectionAttempts.toFixed(1)}`.padStart(numberColumnWidth) + colors.reset;
    });
    
    console.log(row);
  });
});

