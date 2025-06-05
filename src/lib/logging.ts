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

/**
 * Logs a trace message with timestamp if trace logging is enabled
 * @param message - The message to log
 */
export function trace(message: string){  
  if (loggingConfig.trace){
    console.log(`${Date.now()} ${message}`);
  }
}

/**
 * Logs a debug message with timestamp if debug logging is enabled
 * @param message - The message to log
 */
export function debug(message: string){  
  if (loggingConfig.debug){
    console.log(`${Date.now()} ${message}`);
  }
}

/**
 * Testing utilities for the logging system
 * @internal This is only exported for testing purposes
 */
export const _testing = {
  initLogging,
  setConfig: (config: ILoggingConfig) => {
    loggingConfig = config;
  }
};