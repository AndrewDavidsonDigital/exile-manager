const terms = new Map<string, string>([
  ['master','Master'],
  ['bgm','BGM'],
  ['sfx','SFX'],
  ['healthmanabars','HP | Mana: '],
  ['help','Help'],
  ['tutorial','Show Tutorial'],
  ['trace','Trace logs'],
  ['debug','Debugging logs'],
])

export function resolveLabelFromKey(term :string): string{
  const lookup = terms.get(term.toLowerCase());

  if (lookup) {
    return lookup;
  }

  return term;
}
