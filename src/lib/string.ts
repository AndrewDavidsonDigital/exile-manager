/**
 * Converts a decimal number to a percentage string
 * @param value - The decimal value to convert (e.g., 0.5 for 50%)
 * @returns A string representation of the percentage (e.g., "50%")
 */
export function asPercent(value: number){
  return `${value * 100}%`
}