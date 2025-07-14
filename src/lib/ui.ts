
export enum scrollDirection {
  X = 'overflowX',
  Y = 'overflowY',
  BOTH = 'overflow',
}

/**
 * Single Point of mutation for scrolling elements.
 * @param allowScroll Representation of if we are adding locking classes (true) or removing (false) them
 * @param el The HTML Element to lock
 * @param direction Defaults to `scrollDirection.BOTH` as just y or x results in odd safari behavior.
 */
export function toggleScrollLock(allowScroll: boolean, el: HTMLElement, direction: scrollDirection = scrollDirection.BOTH): void{
  if(allowScroll){
    el.style[direction] = 'hidden';
  }else{
    el.style[direction] = '';
  }
}

export const SCROLL_ROOT_ID = 'scrollRoot'

export const REPORT_DOM_ID = '_activity-report';;