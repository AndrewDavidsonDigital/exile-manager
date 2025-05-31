import { expect, test, beforeEach, vi } from 'vitest';
import { trace, debug, _testing } from './logging';

// Mock the storage module
vi.mock('./storage', () => ({
  useLogging: () => ({
    get: vi.fn().mockReturnValue('{ "trace": true, "debug": true }'),
    set: vi.fn()
  })
}));

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
  
  // Reset logging config to default state
  _testing.setConfig({ trace: true, debug: true });
});

test('trace function should log message when trace is enabled', () => {
  const consoleSpy = vi.spyOn(console, 'log');
  const message = 'Test trace message';
  
  trace(message);
  
  expect(consoleSpy).toHaveBeenCalledTimes(1);
  expect(consoleSpy.mock.calls[0][0]).toMatch(/^\d+ Test trace message$/);
  consoleSpy.mockRestore();
});

test('trace function should not log message when trace is disabled', () => {
  _testing.setConfig({ trace: false, debug: true });
  const consoleSpy = vi.spyOn(console, 'log');
  const message = 'Test trace message';
  
  trace(message);
  
  expect(consoleSpy).not.toHaveBeenCalled();
  consoleSpy.mockRestore();
});

test('debug function should log message when debug is enabled', () => {
  const consoleSpy = vi.spyOn(console, 'log');
  const message = 'Test debug message';
  
  debug(message);
  
  expect(consoleSpy).toHaveBeenCalledTimes(1);
  expect(consoleSpy.mock.calls[0][0]).toMatch(/^\d+ Test debug message$/);
  consoleSpy.mockRestore();
});

test('debug function should not log message when debug is disabled', () => {
  _testing.setConfig({ trace: true, debug: false });
  const consoleSpy = vi.spyOn(console, 'log');
  const message = 'Test debug message';
  
  debug(message);
  
  expect(consoleSpy).not.toHaveBeenCalled();
  consoleSpy.mockRestore();
});

test('should use default config when storage is empty', () => {
  vi.mock('./storage', () => ({
    useLogging: () => ({
      get: vi.fn().mockReturnValue(null),
      set: vi.fn()
    })
  }));
  
  _testing.initLogging();
  const consoleSpy = vi.spyOn(console, 'log');
  const message = 'Test message';
  
  trace(message);
  debug(message);
  
  expect(consoleSpy).toHaveBeenCalledTimes(2);
  consoleSpy.mockRestore();
}); 