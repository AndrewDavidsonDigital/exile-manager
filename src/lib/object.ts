/**
 * Fast and loose variable cloning with no-linking from source variable
 * 
 * @description Should only be used for non-functional variables, i.e: `arrays`, `objects`, but not `Sets` or `Maps`
 * @param from Variable to replicate
 * @returns a new instance of the object `from`
 */
export function _cloneDeep<Type>(from: Type): Type {
  return JSON.parse(JSON.stringify(from));
}

/**
 * Fast and loose objects content comparator.
 * 
 * @description Note: Ignores order of children and checks nothing but children and their contents.
 * @param x First object to compare with
 * @param y Second object to compare with
 * @returns True if all children of `X` are in `Y` and `Y` has no other children
 */
export function _isObjectEqual( x: object | undefined, y: object | undefined ):boolean{
  return JSON.stringify(x) === JSON.stringify(y) 
}