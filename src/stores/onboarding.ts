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
  chapter?: string; 
  title: string; 
  attach?: AttachmentPoint; 
  description: string; 
  preAction?: () => void;
  customDelay?: number;
  shouldResize?: boolean;
  sizeFutzing?: ISizeFutzing;
}

interface ISizeFutzing {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
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
          targetDataAttribute: '[data-onboarding-key="navigation-selector"]',
          preAction: () => {(document.querySelector("[data-onboarding-key='navigation-adventure-tab']") as HTMLButtonElement | undefined)?.click()},
          customDelay: 100,
          chapter: 'Navigation',
          title: 'Navigation Menu',
          description: 'This is your main menu for navigating the game.',
          attach: AttachmentPoint.BOTTOM,
        },
        {
          targetDataAttribute: '[data-onboarding-key="navigation-character-button"]',
          chapter: 'Navigation',
          title: 'Show-Hide Character',
          description: 'This button will either show or hide the character pane, (mostly useful on smaller devices), the button will also shimmer when you have an available upgrade.',
          attach: AttachmentPoint.BOTTOM,
        },
        {
          targetDataAttribute: '[data-onboarding-key="navigation-settings-button"]',
          chapter: 'Navigation',
          title: 'Open Settings',
          description: 'This button will open the Settings flyout.',
          attach: AttachmentPoint.BOTTOM,
        },
        {
          targetDataAttribute: '[data-onboarding-key="navigation-adventure-tab"]',
          chapter: 'Navigation',
          title: 'Adventure Tab',
          description: 'This button will change the display to the adventure tab, relating to mission progression. This is one to the main-game tabs.',
          attach: AttachmentPoint.BOTTOM,
        },
        {
          targetDataAttribute: '[data-onboarding-key="navigation-looting-tab"]',
          chapter: 'Navigation',
          title: 'Looting Tab',
          description: 'This button will change the display to the Loot management tab, pertaining to equipping, selling identifying, etc. the loot you have accrued. This is one to the main-game tabs.',
          attach: AttachmentPoint.BOTTOM,
        },


        {
          targetDataAttribute: '[data-onboarding-key="level-selector"]',
          chapter: 'Game Loop',
          title: 'Select Destination',
          description: 'The standard game-loop involves selecting a destination to explore.',
          attach: AttachmentPoint.BOTTOM,
        },
        {
          targetDataAttribute: '[data-onboarding-key="level-selection-0"]',
          chapter: 'Game Loop',
          title: 'Tutorial Destination',
          description: 'This is the tutorial level.',
          attach: AttachmentPoint.BOTTOM,
        },
        {
          targetDataAttribute: '[data-onboarding-key="start-adventure"]',
          preAction: () => {(document.querySelector("[data-onboarding-key='level-selection-0'] button") as HTMLButtonElement | undefined)?.click()},
          chapter: 'Game Loop',
          title: 'Go Adventuring',
          description: 'Once a level has been selected your adventurer will need to going out on the mission.',
        },
        {
          targetDataAttribute: '[data-onboarding-key="combat-logs"]',
          preAction: () => {(document.querySelector("[data-onboarding-key='start-adventure']") as HTMLButtonElement | undefined)?.click()},
          customDelay: 4000,
          shouldResize: true,
          chapter: 'Game Loop',
          title: 'Adventure Results',
          description: 'Your adventurer will navigate through a collection of events, related to the destination they are adventuring in, with the intermittent result being streamed into the combat logs',
        },


        {
          targetDataAttribute: '[data-onboarding-key="character-pane"]',
          chapter: 'Character',
          title: 'Character Panel',
          description: 'This is the Character panel where you can see all the information about your Exile.',
        },
        {
          targetDataAttribute: '[data-onboarding-key="health-mana-panel"]',
          chapter: 'Character',
          title: 'Health and Mana',
          description: 'Health is the amount of damage your Exile can take, while mana is `main` the currency for using skills.',
        },
        {
          targetDataAttribute: '[data-onboarding-key="stats-panel-visual"]',
          preAction: () => {
            if(! ((document.querySelector("[data-onboarding-key='stats-panel-visual']") as HTMLElement | undefined)?.checkVisibility())){
              (document.querySelector("[data-onboarding-key='stats-panel-button']") as HTMLButtonElement | undefined)?.click();
            }
          },
          shouldResize: true,
          customDelay: 1000,
          chapter: 'Character',
          title: 'Attributes and Stats',
          description: 'Here is the breakdown of the Exile\'s current details, including any temporary buffs and changes from items, or passives',
        },
        {
          targetDataAttribute: '[data-onboarding-key="experience-panel"]',
          chapter: 'Character',
          title: 'Experience',
          description: 'Any and all events that occur during an adventure will provide the Exile with experience, when this bar fills up, they will level-up and be able to select a reward',
        },
        {
          targetDataAttribute: '[data-onboarding-key="level-up-section"]',
          chapter: 'Character',
          title: 'Leveling Up',
          description: 'Once you have level\'d up, depending on the new-level, you will be able to select either: a new Skill, a new Passive, or an attribute increase. ',
        },
        {
          targetDataAttribute: '[data-onboarding-key-2="all-skills"]',
          chapter: 'Character',
          title: 'Skills',
          description: 'The skills menu will either; if you have a level-up available, present you with a selection of possible new skills for you to choose 1 of. Other you will be able to manage all your current skills, turning them on / off',
        },
        {
          targetDataAttribute: '[data-onboarding-key="manage-skills"]',
          chapter: 'Character',
          title: 'Battle Skills',
          description: 'Most skills are tagged as battle skills and will automatically be used when available, during combat encounters',
        },
        {
          targetDataAttribute: '[data-onboarding-key="world-skills"]',
          chapter: 'Character',
          title: 'World Skills',
          description: 'Some skills are tagged as world skills and will be need to activated manually between runs',
        },
        {
          targetDataAttribute: '[data-onboarding-key="manage-passives"]',
          chapter: 'Character',
          title: 'Passives',
          description: 'The passives menu will either; if you have a level-up available, present you with a selection of possible new passives for you to choose 1 of. Other you will be able to view all your current passives',
        },
        {
          targetDataAttribute: '[data-onboarding-key="manage-attributes"]',
          chapter: 'Character',
          title: 'Attributes',
          description: 'The attributes menu will only be available if you have the opportunity to enhance an attribute',
        },


        {
          targetDataAttribute: '',
          chapter: 'Looting',
          preAction: () => {(document.querySelector("[data-onboarding-key='navigation-looting-tab']") as HTMLButtonElement | undefined)?.click();},
          customDelay: 500,
          description: 'We\'ve now swapped to the looting tab.',
        },


        {
          targetDataAttribute: '',
          chapter: 'Tutorial Completed',
          title: 'Time to Roll',
          preAction: () => {(document.querySelector("[data-onboarding-key='navigation-adventure-tab']") as HTMLButtonElement | undefined)?.click();},
          customDelay: 500,
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
      this.currentStep = -1;
      
      const ctx = this.el.getContext('2d');
      if (ctx){
        resetToBackdrop(ctx);
      }
      setTimeout(() => {
        this.progress();
        this.active = true;
      },50)
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
  ctx.fillStyle = 'oklch(27.9% 0.041 260.031 / 80%)';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height );
}

function highlightElement(ctx: CanvasRenderingContext2D, targetQuery: string){
  if (!targetQuery) return;
  
  const elements = document.querySelectorAll(targetQuery);

  if (elements.length === 0) return;
  elements.forEach(el => {
    logger(`HEIGHT: target element heights: rect(${el.getBoundingClientRect().y}) client(${el.clientHeight}) scroll(${el.scrollHeight})`, );
    const deltaY = el.clientHeight - el.scrollHeight;
    let { x, y, width } = el.getBoundingClientRect();
    
    logger(`HEIGHT: target element height delta [${deltaY}]`);
    
    const height = el.clientHeight  ;
    const scrollRoot = document.querySelector("#scrollRoot");
    if (scrollRoot) y = scrollRoot.scrollTop + y;

    el.scrollIntoView({ behavior: 'smooth', block: 'end' });

    setTimeout(
      () => {
        logger(`HEIGHT: clearRect(${x}, ${y}, ${width}, ${height} )`);
        ctx.clearRect(x, y, width, height );

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.strokeRect(x-2, y-2, width+4, height+4 );
      },
      50,
    )

  })
}
