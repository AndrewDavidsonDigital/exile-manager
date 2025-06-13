
export enum scrollDirection {
  X = 'overflowX',
  Y = 'overflowY',
  BOTH = 'overflow',
}


export function toggleScrollLock(allowScroll: boolean, el: HTMLElement, direction: scrollDirection = scrollDirection.Y){
  if(allowScroll){
    el.style[direction] = 'hidden';
  }else{
    el.style[direction] = '';
  }
}