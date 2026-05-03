import { describe, it, expect, vi } from 'vitest';
import { logger, formatMessage, shouldLog, LOG_LEVELS } from './logger';

describe('Logger', () => {
  describe('LOG_LEVELS', () => {
    it('should have correct numeric ordering', () => {
      expect(LOG_LEVELS.debug).toBe(0);
      expect(LOG_LEVELS.info).toBe(1);
      expect(LOG_LEVELS.warn).toBe(2);
      expect(LOG_LEVELS.error).toBe(3);
    });
  });

  describe('shouldLog', () => {
    it('should allow info level and above (default level is info)', () => {
      expect(shouldLog('info')).toBe(true);
      expect(shouldLog('warn')).toBe(true);
      expect(shouldLog('error')).toBe(true);
    });

    it('should block debug when current level is info', () => {
      expect(shouldLog('debug')).toBe(false);
    });
  });

  describe('formatMessage', () => {
    it('should include timestamp and level in uppercase', () => {
      const msg = formatMessage('info', 'hello');
      expect(msg).toMatch(/^\[\d{4}-\d{2}-\d{2}T/);
      expect(msg).toContain('[INFO]');
      expect(msg).toContain('hello');
    });

    it('should format warn level correctly', () => {
      const msg = formatMessage('warn', 'caution');
      expect(msg).toContain('[WARN]');
      expect(msg).toContain('caution');
    });

    it('should format error level correctly', () => {
      const msg = formatMessage('error', 'failure');
      expect(msg).toContain('[ERROR]');
    });

    it('should format debug level correctly', () => {
      const msg = formatMessage('debug', 'trace');
      expect(msg).toContain('[DEBUG]');
    });
  });

  describe('logger methods', () => {
    it('should call console.info for logger.info', () => {
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      logger.info('test message');
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    it('should call console.warn for logger.warn', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      logger.warn('warning message');
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    it('should call console.error for logger.error', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      logger.error('error message');
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    it('should NOT call console.debug when level is info', () => {
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      logger.debug('debug message');
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
