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