const EXAMPLE_NAMES:Readonly<string[]> = [
  'Aegis', 'Aerith', 'Aether', 'Aria', 'Aurora',
  'Balthazar', 'Bastion', 'Blade', 'Blaze', 'Blitz',
  'Caelum', 'Cinder', 'Cipher', 'Crimson', 'Crystal',
  'Dawn', 'Dragon', 'Draven', 'Dravos', 'Dusk',
  'Eagle', 'Echo', 'Eclipse', 'Eldara', 'Ember',
  'Fable', 'Faelan', 'Flame', 'Gale', 'Ghost',
  'Glade', 'Glory', 'Grimm', 'Harbinger', 'Hawk',
  'Helios', 'Icarus', 'Ion', 'Iron', 'Iris',
  'Ivory', 'Jade', 'Jareth', 'Jinx', 'Jupiter',
  'Kael', 'Karma', 'Kestrel', 'Knight', 'Kraken',
  'Lance', 'Legend', 'Luna', 'Lysander',
  'Mist', 'Mordecai', 'Nebula', 'Night', 'Nova',
  'Nyx', 'Oberon', 'Odin', 'Omega', 'Oracle',
  'Orion', 'Pandora', 'Perseus', 'Phantom', 'Phoenix',
  'Prism', 'Quantum', 'Quest', 'Quasar', 'Quill',
  'Quinn', 'Raven', 'Rift', 'Rune',
  'Shadow', 'Spirit', 'Star', 'Storm', 'Sylvan',
  'Tempest', 'Thorne', 'Thunder', 'Titan', 'Umbra',
  'Unity', 'Ulysses', 'Valkyrie', 'Vesper', 'Viper',
  'Void', 'Vortex', 'Wisp', 'Wolf', 'Whisper',
  'Wilder', 'Wraith', 'Xander', 'Xen', 'Xenith',
  'Xenon', 'Xerxes', 'Yara', 'Yggdrasil', 'Yin',
  'Ymir', 'Zephyr', 'Zephyrus', 'Zeal', 'Zion',
  'Ithaqua', 'Cthuga'
]; 

const CUSTOM_NAME:Readonly<string[]>  = [
  'Roiden', 
  'Nylos', 'Vedorys', 'Syrodev', 
  'Serathal', 'Zenith'
]

/**
 * A collection of fantasy-themed character names.
 * Used for generating random character names in the game
 */
export const FANTASY_NAMES:Readonly<string[]> = [
  ...EXAMPLE_NAMES,
  ...CUSTOM_NAME,
];