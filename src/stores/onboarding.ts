import { trace } from '@/lib/logging';
import { defineStore } from 'pinia';
import { _cloneDeep } from '@/lib/object';
import { ONBOARDING_CANVAS_ID } from '@/lib/core';

const LOGGING_PREFIX = '👋 Onboarding:\t';

interface IOnboarding {
  el: HTMLCanvasElement | null;
  active: boolean;
  currentStep: number;
  steps: IStep[];
  activeTimerIds: number[];
}

enum AttachmentPoint {
  BOTTOM = 'bottom',
}

interface IStep{
  targetDataAttribute: string;
  title?: string; 
  attach?: AttachmentPoint; 
  description: string; 
  preAction?: () => void;
  customDelay?: number;
  shouldResize?: boolean;
}

export const useOnboardingEngine = defineStore('onboarding', {
  state: () => {
    return {
      el: null,
      active: false,
      currentStep: -1,
      activeTimerIds: [],
      steps: [
        {
          targetDataAttribute: '[data-onboarding-key="level-selector"]',
          title: 'Select Destination',
          description: 'The standard game-loop involves selecting a destination to explore.',
          attach: AttachmentPoint.BOTTOM,
        },
        {
          targetDataAttribute: '[data-onboarding-key="start-adventure"]',
          preAction: () => {(document.querySelector("[data-onboarding-key='level-selection-0'] button") as HTMLButtonElement | undefined)?.click()},
          title: 'Go Adventuring',
          description: 'Once a level has been selected your adventurer will need to going out on the mission.',
        },
        {
          targetDataAttribute: '[data-onboarding-key="combat-logs"]',
          preAction: () => {(document.querySelector("[data-onboarding-key='start-adventure']") as HTMLButtonElement | undefined)?.click()},
          customDelay: 4000,
          shouldResize: true,
          title: 'Adventure Results',
          description: 'Your adventurer will navigate through a collection of events, related to the destination they are adventuring in, with the intermittent result being streamed into the combat logs',
        },


        {
          targetDataAttribute: '',
          title: 'Time to Roll',
          description: 'You should now be relatively familiar with the basic game mechanics, remember you can always look up any / most terms, (yell at me if its not in there) in the help / journal',
        }
      ]
    } as IOnboarding;
  },

  getters: {
    isOnboarding(): boolean{
      return this.active;
    },
    getCurrentStep(): IStep{
      return this.steps[this.currentStep];
    },
    isStepPositioningTop(): boolean{
      return this.steps[this.currentStep]?.attach !== AttachmentPoint.BOTTOM || false;
    },
  },

  actions: {
    restart(): void{
      logger('Restarting onboarding state');

      this.activeTimerIds.forEach(id => clearTimeout(id));
      logger(`purging timers: ${this.activeTimerIds}`);
      this.activeTimerIds.splice(0, this.activeTimerIds.length);
      logger(`timers purged: ${this.activeTimerIds}`);

      this.$reset();
      this.init();
    },
    init(): void{
      logger('Re-binding to canvas state');
      
      const el = document.getElementById(ONBOARDING_CANVAS_ID);
      if (!el || el.tagName !== 'CANVAS'){
        logger(`Unable to resolve onboarding canvas`);
      }
      // casting is fine as the tag definition is of `CANVAS`
      this.el = (el as HTMLCanvasElement);
    },
    progress(forwards: boolean = true): void{
      logger(`Moving to the ${forwards ? 'next' : 'previous'} step`);
      if (
        (forwards && this.currentStep + 1 > this.steps.length)
        || (!forwards && this.currentStep <= 0)
        || !this.el
      )return;

      this.currentStep += 1 * (forwards ? 1 : -1)

      const ctx = this.el.getContext('2d');
      const thisStep = this.steps[this.currentStep];

      logger(`processing step ${this.currentStep}, details: ${JSON.stringify(thisStep)}`);
      if (ctx && thisStep){

        if (thisStep.preAction) {
          logger(`running action: ${thisStep.preAction}`);
          thisStep.preAction();
        }
        this.activeTimerIds.forEach(id => clearTimeout(id));
        logger(`purging timers: ${this.activeTimerIds}`);
        this.activeTimerIds.splice(0, this.activeTimerIds.length);
        logger(`timers purged: ${this.activeTimerIds}`);

        if (thisStep.customDelay){
          resetToBackdrop(ctx);
        }
        const id = setTimeout(
          () => {
            if (thisStep.shouldResize) this.ensureSizeIsBound(); 
            resetToBackdrop(ctx);
            const id = setTimeout(
              () => {
                resetToBackdrop(ctx);
                highlightElement(ctx, thisStep.targetDataAttribute);
                this.activeTimerIds.forEach(id => clearTimeout(id));
                logger(`purging timers: ${this.activeTimerIds}`);
                this.activeTimerIds.splice(0, this.activeTimerIds.length);
                logger(`timers purged: ${this.activeTimerIds}`);
              },
              100
            ) as unknown as number;
            this.activeTimerIds.forEach(id => clearTimeout(id));
            logger(`purging timers: ${this.activeTimerIds}`);
            this.activeTimerIds.splice(0, this.activeTimerIds.length);
            logger(`timers purged: ${this.activeTimerIds}`);
            this.activeTimerIds.push(id);
          },
          thisStep.customDelay || 100,
        ) as unknown as number;
        this.activeTimerIds.push(id);
      }
    },
    stop(): void{
      logger(`Stopping the onboarding view`);
      if (!this.el) return;
      this.active = false;

      this.activeTimerIds.forEach(id => clearTimeout(id));
      logger(`purging timers: ${this.activeTimerIds}`);
      this.activeTimerIds.splice(0, this.activeTimerIds.length);
      logger(`timers purged: ${this.activeTimerIds}`);

      const ctx = this.el.getContext('2d');
      if (ctx){
        ctx.reset();
      }

    },
    activate(): void{
      logger(`Starting up onboarding canvas`);
      if (!this.el) return;
      this.active = true;
      this.currentStep = -1;

      const ctx = this.el.getContext('2d');
      if (ctx){

        resetToBackdrop(ctx);
      }
      this.progress();
    },
    ensureSizeIsBound(): void{
      logger(`Attempting to re-bind canvas's height and width to be full-screen`);
      if (!this.el) return

      this.el.height = this.el.clientHeight;
      this.el.width = this.el.clientWidth;
    },
  },

});

function logger(message: string): void{
  trace(`${LOGGING_PREFIX}${message}`);
}

function resetToBackdrop(ctx: CanvasRenderingContext2D): void{
  
  ctx.reset();
  ctx.fillStyle = 'oklch(27.9% 0.041 260.031 / 60%)';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height );
}

function highlightElement(ctx: CanvasRenderingContext2D, targetQuery: string){
  if (!targetQuery) return;
  
  const el = document.querySelector(targetQuery);

  if (el){
    logger(`HEIGHT: target element heights: rect(${el.getBoundingClientRect().y}) client(${el.clientHeight}) scroll(${el.scrollHeight})`, );
    const deltaY = el.clientHeight - el.scrollHeight;
    let { x, y, width } = el.getBoundingClientRect();
    
    logger(`HEIGHT: target element height delta [${deltaY}]`);

    const scrollRoot = document.querySelector("#scrollRoot");
    if (scrollRoot) y = scrollRoot.scrollTop + y;

    el.scrollIntoView({ behavior: 'smooth', block: 'end' });

    const height = el.clientHeight  ;
    logger(`HEIGHT: clearRect(${x}, ${y}, ${width}, ${height} )`);
    ctx.clearRect(x, y, width, height );

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 3;
    ctx.strokeRect(x-2, y-2, width+4, height+4 );
  }
}
