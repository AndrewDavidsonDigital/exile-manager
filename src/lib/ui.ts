
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