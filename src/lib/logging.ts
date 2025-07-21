import { useLogging } from "./storage";

export interface ILoggingConfig {
  trace: boolean;
  debug: boolean;
}

export type LoggingConfigKeyType = keyof ILoggingConfig;
export const LoggingConfigKeys = ['trace', 'debug'] as  LoggingConfigKeyType[];

let currentConfig: ILoggingConfig;

function initLogging(): void {
  const loggingStorage = useLogging();
  currentConfig = JSON.parse((loggingStorage.get() || '{ "trace": false, "debug": false }')) as ILoggingConfig;
  loggingStorage.set(JSON.stringify(currentConfig));
}

export function getLogging(): ILoggingConfig{
  if (!currentConfig){
    initLogging();
  }
  return currentConfig;
}

export function updateLogging(key: LoggingConfigKeyType, newValue: boolean): void {
  const loggingStorage = useLogging();
  if (!currentConfig){
    initLogging();
  }
  currentConfig[key] = newValue;
  loggingStorage.set(JSON.stringify(currentConfig));
}

// Initialize logging by default
initLogging();

/**
 * Logs a trace message with timestamp if trace logging is enabled
 * @param message - The message to log
 */
export function trace(message: string): void{  
  if (currentConfig.trace){
    console.log(`${Date.now()} ${message}`);
  }
}

/**
 * Logs a debug message with timestamp if debug logging is enabled
 * @param message - The message to log
 */
export function debug(message: string): void{  
  if (currentConfig.debug){
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
    currentConfig = config;
  }
};