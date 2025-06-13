const terms = new Map<string, string>([
  ['master','Master'],
  ['bgm','BGM'],
  ['sfx','SFX'],
  ['healthmanabars','HP | Mana: '],
])

export function resolveLabelFromKey(term :string){
  if (terms.has(term.toLowerCase())){
    return terms.get(term.toLowerCase());
  }
  return term;
}