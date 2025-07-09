/**
 * Represents a release version of the application
 */
export interface IRelease {
  /** Version number in semantic versioning format */
  version: string;
  /** Whether this release contains breaking changes */
  isBreaking?: boolean;
  /** Whether this release requires a data purge */
  requiresPurge?: boolean;
  /** List of major changes in this release */
  highlights: string[];
  /** Git commit hash for this release */
  commit: string;
  /** URL to compare with previous version */
  compare?: string;
}

export const releases: IRelease[] = [
  {
    version: '0.1.6',
    isBreaking: true,
    requiresPurge: true,
    highlights: [
      'Fix bug where if the starting skill was a world skill, you were never able to select a new skill on level-up',
      'Engine performance tweaks',
      'Game options persistence between sessions',
      'Add Affix Synergy system, items with multiple of the same affixes will get a multiplier to those affixes',
      'Fix bug where-by a user could refresh the Passives offered to them',
      'Fix bug where-by a user could refresh the Skills offered to them',
      'Added support for event based level generation. . . follow that lanky turtle to raid its stores',
      'Add initial meta-progression with town and town unlocks (Bulk ID, Bulk Salvage, Auto-Salvage)',
      'Add a couple more levels / destinations to logically uncover the town and then provide dynamic areas',
      'Add audio feedback for generic clicks',
      'Add audio feedback for some specific / custom elements (e.g: identifying / selling )',
      'Add support for Class-Specific critical hit effects'
    ],
    commit: '',
    compare: 'v0.1.5...v0.1.6',
  },
  {
    version: '0.1.5',
    highlights: [
      'Settings menu',
      'Engine Updates',
      'Health/Mana Bars for mobile',
      'Toggleable Health/Mana Bars for desktop',
    ],
    commit: '394274e2559fad7aa679bd5ca9119c91e0909960',
    compare: 'v0.1.4...v0.1.5',
  },
  {
    version: '0.1.4',
    isBreaking: true,
    requiresPurge: true,
    highlights: [
      'Initial work on dynamic mission system',
      'Initial progression flow of base missions is in',
      'Logical framework for Ad-hock generating levels',
      'Support for transient missions',
      'Support for finding a new bonus mission',
      'Small UI tweaks for equipment',
      'Added dedicated close modal buttons for some modals, IOS not supporting light-dismiss yet :(',
      'Fixed an issue where initial starter skills were not filtered by class',
      'Addition of mana regen as both a mechanic and affix set',
      'Addition of health regen as both a mechanic and affix set',
      'Fix an issue with Physical resistance not calculating',
      'Added missing logic for capping resistances at 75%',
      'Normalization pass over most affixes',
      'All affixes now have additional tiers (T4->T11)',
      'Internal tooling to visualize the scaling curves',
      'Mobile UI refinement',
      'Ability to auto-salvage items by tiers',
      'Fixed a bug where once out of passives or skills (temporary fix) you\'d still be offered them as levelup rewards',
      'Fixed some inaccurate reporting in the combat log',
    ],
    commit: '',
    compare: 'v0.1.3...v0.1.4',
  },
  {
    version: '0.1.3',
    highlights: [
      'Complete the last aspects of Item System 2.5',
      'Embedded Affix are also limited by item type',
      'Fixed issue with over-recovering mana, and over spending (negative mana)',
      'Added support for Class bases limits to some passives and skills',
      'Fixed issue where defeating an enemy in 1-shot meant a cooldown tick didn\'t occur',
    ],
    commit: 'b1dc7f14750b226f2689acba8f811b9b351b9d26',
    compare: 'v0.1.2...v0.1.3',
  },
  {
    version: '0.1.2',
    highlights: [
      'Loot Brushes (delete / ID) are now force de-selected when starting an adventure',
      'Level up choice for cases when neither skill nor passive is landed',
    ],
    commit: '192cd562ee97b4d48f3b7be481ea8f6e1989004b',
    compare: 'v0.1.1...v0.1.2',
  },
  {
    version: '0.1.1',
    highlights: [
      'Fix issue with being re-offered already owned passives / skills',
    ],
    commit: 'f396782570e1a19b6bc499902420915ce88c56d7',
    compare: 'v0.1.0...v0.1.1',
  },
  {
    version: '0.1.0',
    isBreaking: true,
    requiresPurge: true,
    highlights: [
      'Tweak leveling system',
      'Add passives',
      'Add combat skills',
      'Add world skills',
      'Add Loot Tier filter',
      'UI pass on Items',
      'Affixes now all have upto tier-3',
      'Affixes are now level gated within bands relative to the itemLevel',
    ],
    commit: '78d4143f2d7f703448e957bc06402d7c9aca2816',
    compare: 'v0.0.11...v0.1.0',
  },
  {
    version: '0.0.11',
    highlights: [
      'Fix bug with death recap modal being dismissible',
      'Fix bug with over healing with % calculations :o',
    ],
    commit: '0ea29bc61fe9ee2de833e462fadbbd6842493b31',
    compare: 'v0.0.10...v0.0.11',
  },
  {
    version: '0.0.10',
    highlights: [
      'Add visual summation of item base-stats',
      'Add item comparison gui',
      'Add quick-swap ability',
      'Save some more space on mobile',
      'Tweak auto-play logic so that more devices will auto-play',
    ],
    commit: '',
    compare: 'v0.0.9...v0.0.10',
  },
  {
    version: '0.0.9',
    isBreaking: true,
    requiresPurge: true,
    highlights: [
      'All data reset to allow for new items configurations',
      'Added support for Item bases to have values',
      'Base affixes are immutable, but rolled from a pool per category (all armour shares same pool, shoulders, boots, etc. )',
      'Base affixes are also rolled scaled by rarity and item level, (a basic +10 health, could get up-to a 1.5x multiplier from rarity and an additional 10% increase due to its item level )',
      'Values are displayed and used in calculations but currently NOT exposed under \'Equipment Stats\' expander',
      'Added some more custom randomised names',
      'Removes some odd randomised names.... mage, isn\'t a name',
    ],
    commit: '777d17635739358985fa13f1929dfac0bfc91caf',
    compare: 'v0.0.8...v0.0.9',
  },
  {
    version: '0.0.8',
    highlights: [
      'Fix issue with item-delete ALWAYS removing from inventory even when item was in stash . . . :O',
      'Fix some values related to Crit',
      'Added Help / Encyclopedia section',
      'Wire Item drop types to be biassed via area biasses',
      'Wire Item drop rarity to be biassed via area level'
    ],
    commit: 'beebc456579a7c1442dbbafff377d50365809bfa',
    compare: 'v0.0.7...v0.0.8',
  },
  {
    version: '0.0.7',
    highlights: [
      'Event weighting tweaks',
      'Add loot management brushes for Identify',
      'Add loot management brushes for Delete',
      'Add Critical Strike',
      'Add `repeat run` button',
      'Add `Detailed` logs support',
    ],
    commit: 'c268848c2fd813c5f416b2414168b34e7947eb25',
    compare: 'v0.0.6...v0.0.7',
  },
  {
    version: '0.0.6',
    isBreaking: true,
    requiresPurge: true,
    highlights: [
      'Responsive fixes',
      'Add item-level',
      'Tweak scrolling timings',
      'Add gold on item destruction at 10% of value',
      'Secret events',
    ],
    commit: 'ceb030a7b3c2f968f25345641e34b2c73d6763a1',
    compare: 'v0.0.5...v0.0.6',
  },
  {
    version: '0.0.5',
    highlights: [
      'Visual UI tweaks and restructuring',
      'Enhanced UX when starting-missions',
      'Added Roadmap',
      'Added selected item traversal ( prev / next item ) for mobile, ... ok desktop can have this too',
    ],
    commit: '1abbe3caa66cf9eda205e22a042f625a69a0a1d3',
    compare: 'v0.0.4...v0.0.5',
  },
  {
    version: '0.0.4',
    isBreaking: true,
    requiresPurge: true,
    highlights: [
      'Fix issue with Physical Damage affixes not being considered correctly for damage',
      'Add release notes, (This page :D)',
      'Ability to randomize the char name',
      'Add ability to delete items',
      "Fix issue where value ranges could end up with equal min and max values, i.e: no more `adds 3 to 3 physical damage`"
    ],
    commit: '73a1ca22670825cc63b97c3959b251915732c54e',
    compare: 'v0.0.3...v0.0.4',
  },
  {
    version: '0.0.3',
    highlights: [
      'Add initial mobile support',
      'Enhancements to the loot manager',
      'Items are now filterable',
    ],
    commit: 'e6345d1b5146db936e4b123a9c802a6309e914ae',
    compare: 'v0.0.2...v0.0.3',
  },
  {
    version: '0.0.2',
    isBreaking: true,
    highlights: [
      'Remove caching-key from track-player',
      'Add support for version re-syncing',
      'Rework how item affixes are handled and managed internally, (Allow ranges to actually exist)',
    ],
    commit: 'd71e5faa74d4f5b6f0db71e868f62fc7b7785df4'
  },
  {
    version: '0.0.1',
    highlights: [
      'First version released? i think . . .',
      'Base game loop available',
      'Loot manager',
      'First pass on equipping items',
    ],
    commit: 'e45b2a7a927421e96b99679fdf3697330801d98b',
  }
]; 