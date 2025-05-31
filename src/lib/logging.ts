import { useLogging } from "./storage";

interface ILoggingConfig {
  trace: boolean;
  debug: boolean;
}

let loggingConfig: ILoggingConfig;

function initLogging() {
  const loggingStorage = useLogging();
  loggingConfig = JSON.parse((loggingStorage.get() || '{ "trace": true, "debug": true }')) as ILoggingConfig;
  loggingStorage.set(JSON.stringify(loggingConfig));
}

// Initialize logging by default
initLogging();

export function trace(message: string){  
  if (loggingConfig.trace){
    console.log(`${Date.now()} ${message}`);
  }
}

export function debug(message: string){  
  if (loggingConfig.debug){
    console.log(`${Date.now()} ${message}`);
  }
}

// Export for testing purposes
export const _testing = {
  initLogging,
  setConfig: (config: ILoggingConfig) => {
    loggingConfig = config;
  }
};