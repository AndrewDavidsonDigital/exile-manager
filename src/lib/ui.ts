
export enum scrollDirection {
  X = 'overflowX',
  Y = 'overflowY',
  BOTH = 'overflow',
}


export function toggleScrollLock(allowScroll: boolean, el: HTMLElement, direction: scrollDirection = scrollDirection.Y): void{
  if(allowScroll){
    el.style[direction] = 'hidden';
  }else{
    el.style[direction] = '';
  }
}

export const SCROLL_ROOT_ID = 'scrollRoot'

export const REPORT_DOM_ID = '_activity-report';;