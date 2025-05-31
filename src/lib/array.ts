export function pluckKeys(collection: {[x:string]: any}, keys: string[] | readonly string[]){
  const retval: {[x:string]: any} = {};

  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(collection, key)){
      if (typeof collection[key] === 'object'){
        retval[key] = {...collection[key]};
      } else if (Array.isArray(collection[key])) {
        retval[key] = [...collection[key]];
      } else {
        retval[key] = collection[key];
      }
    }
  });

  return retval;
}
