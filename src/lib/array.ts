/**
 * Extracts specified keys from a collection of objects
 * @param collection The object collection to extract keys from
 * @param keys The array of keys to extract
 * @returns A new object containing only the specified keys and their values
 */
export function pluckKeys(collection: {[x:string]: any}, keys: string[] | readonly string[]): {
  [x: string]: any;
} {
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

/**
 * Helper method to randomly choose an element from a given array.
 * @param collection The collection from which to randomly choose
 * @param defaultValue specification for value to return when failure
 * @returns the element at a random index if able to, `defaultValue` otherwise
 */
export function chooseRandom<T>(collection: Array<T>, defaultValue: T ): T{
  if (collection.length === 0 ) return defaultValue;
  try{
    const randIndex = Math.floor(Math.random() * (collection.length - 0.5));
    // console.log(`resolving to index [${randIndex}] as value: `, collection[randIndex]);
    return collection[randIndex];
  }catch (e){
    console.warn(`[chooseRandom] \tException when resolving random value from collection, ${(e as Error).name}`);
    return defaultValue;
  }
}