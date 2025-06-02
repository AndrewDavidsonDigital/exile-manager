export type StorageKeys = 
    'exileManagerEngine_logging'  
  | 'exileManagerEngine_config'  
  | 'exileManagerEngine_state'
  // | 'illusionEngine_CG'  
  // | 'illusionEngine_complete'
;

export function has(key: StorageKeys){
  return window.localStorage.getItem(key) !== null;
}

function get(key: StorageKeys){
  return window.localStorage.getItem(key);
}

function set(key: StorageKeys, value: string){
  return window.localStorage.setItem(key, value);
}
function remove(key: StorageKeys){
  return window.localStorage.removeItem(key);
}

/*
export function useCurrentGame() {
  return {
    'get'  : () => get('illusionEngine_CG'),
    'set'  : (value: string) => set('illusionEngine_CG', value),
    '$set' : (value: object) => set('illusionEngine_CG', JSON.stringify(value)),
    'clear': () => set('illusionEngine_CG', '{}')
  }
}

export function useCompleteGame() {
  return {
    'get'  : () => get('illusionEngine_complete'),
    'set'  : (value: string) => set('illusionEngine_complete', value),
    '$set' : (value: object) => set('illusionEngine_complete', JSON.stringify(value)),
    'clear': () => set('illusionEngine_complete', '{}')
  }
}

export function useStorage() {
  return {
    'get': () => get('illusionEngine_state'),
    'set': (value: string) => set('illusionEngine_state', value),
    'reset': () => set('illusionEngine_state', JSON.stringify(
      Array(10).fill({
        active: false,
        chapterIndex: "",
        dateTime: Date.now(),
        sceneIndex: "",
        title: "New Save",
        transitionIndex: ""
      })
    ))
  }
}
*/

export function useLogging() {
  return {
    'get': () => get('exileManagerEngine_logging'),
    'set': (value: string) => set('exileManagerEngine_logging', value)
  }
}

export function useConfig() {
  return {
    'get': () => get('exileManagerEngine_config'),
    'set': (value: string) => set('exileManagerEngine_config', value)
  }
}

export function useGameState() {
  return {
    'get': () => {
      const state = get('exileManagerEngine_state');
      return state ? JSON.parse(state) : null;
    },
    'set': (value: string) => set('exileManagerEngine_state', value),
    '$set': (value: object) => set('exileManagerEngine_state', JSON.stringify(value)),
    'clear': () => set('exileManagerEngine_state', '{}'),
    'remove': () => remove('exileManagerEngine_state'),
  }
}