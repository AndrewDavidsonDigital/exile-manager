/**
 * Helper to resolve the intersections of multiple sets
 * @param sets The collection of sets from which to find our intersections
 * @returns A new set containing only the intersected elements
 */
export function intersectSets(...sets: Set<string>[]): Set<string> {
  if (sets.length === 0) return new Set();
  if (sets.length === 1) return sets[0];
  
  return sets.reduce((result, currentSet) => 
    result.intersection(currentSet)
  );
}
