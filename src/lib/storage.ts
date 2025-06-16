/**
 * Type definition for storage keys used in the application
 */
export type StorageKeys = 
    'exileManagerEngine_logging'  
  | 'exileManagerEngine_config'  
  | 'exileManagerEngine_state'
;

/**
 * Checks if a storage key exists in localStorage
 * @param key - The storage key to check
 * @returns boolean indicating if the key exists
 */
// function has(key: StorageKeys){
//   return window.localStorage.getItem(key) !== null;
// }

/**
 * Retrieves a value from localStorage
 * @param key - The storage key to retrieve
 * @returns The stored value or null if not found
 */
function get(key: StorageKeys){
  return window.localStorage.getItem(key);
}

/**
 * Sets a value in localStorage
 * @param key - The storage key to set
 * @param value - The value to store
 */
function set(key: StorageKeys, value: string){
  return window.localStorage.setItem(key, value);
}

/**
 * Removes a value from localStorage
 * @param key - The storage key to remove
 */
function remove(key: StorageKeys){
  return window.localStorage.removeItem(key);
}

/**
 * Hook for managing logging state in localStorage
 * @returns An object with functions to get and set logging state
 */
export function useLogging() {
  return {
    'get': () => get('exileManagerEngine_logging'),
    'set': (value: string) => set('exileManagerEngine_logging', value)
  }
}

/**
 * Hook for managing game configuration in localStorage
 * @returns An object with functions to get and set game configuration
 */
export function useConfig() {
  return {
    'get': () => {
      const state = get('exileManagerEngine_config');
      return state ? JSON.parse(state) : null;
    },
    'set': (value: string) => set('exileManagerEngine_config', value),
    '$set': (value: object) => set('exileManagerEngine_config', JSON.stringify(value)),
  }
}

/**
 * Hook for managing game state in localStorage
 * @returns An object with functions to get and set game state
 */
export function useGameState() {
  return {
    /**
     * Retrieves the game state from storage
     * @returns Parsed game state object or null if not found
     */
    'get': () => {
      const state = get('exileManagerEngine_state');
      return state ? JSON.parse(state) : null;
    },
    /**
     * Sets the game state as a string
     * @param value - The string value to store
     */
    'set': (value: string) => set('exileManagerEngine_state', value),
    /**
     * Sets the game state as an object (automatically stringifies)
     * @param value - The object to store
     */
    '$set': (value: object) => set('exileManagerEngine_state', JSON.stringify(value)),
    /**
     * Clears the game state by setting it to an empty object
     */
    'clear': () => set('exileManagerEngine_state', '{}'),
    /**
     * Removes the game state from storage
     */
    'remove': () => remove('exileManagerEngine_state'),
  }
}