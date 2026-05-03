import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateQuery,
  sanitizeInput,
  buildMapEmbedUrl,
  buildPollingBoothQuery,
  DEFAULT_ZOOM,
  DEFAULT_MAP_TYPE,
  MAPS_EMBED_BASE,
} from './map';

describe('Map Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('constants', () => {
    it('should have correct default zoom', () => {
      expect(DEFAULT_ZOOM).toBe(14);
    });

    it('should have roadmap as default type', () => {
      expect(DEFAULT_MAP_TYPE).toBe('roadmap');
    });

    it('should have correct embed base URL', () => {
      expect(MAPS_EMBED_BASE).toContain('google.com/maps/embed');
    });
  });

  describe('validateQuery', () => {
    it('should accept valid query', () => {
      expect(validateQuery('New Delhi')).toBe(true);
    });

    it('should reject empty string', () => {
      expect(validateQuery('')).toBe(false);
    });

    it('should reject single character', () => {
      expect(validateQuery('a')).toBe(false);
    });

    it('should reject null/undefined as string', () => {
      expect(validateQuery(null as unknown as string)).toBe(false);
      expect(validateQuery(undefined as unknown as string)).toBe(false);
    });

    it('should reject whitespace-only string', () => {
      expect(validateQuery('   ')).toBe(false);
    });

    it('should reject string longer than 500 chars', () => {
      const longStr = 'a'.repeat(501);
      expect(validateQuery(longStr)).toBe(false);
    });

    it('should accept string at exactly 500 chars', () => {
      const str = 'ab'.repeat(250);
      expect(validateQuery(str)).toBe(true);
    });

    it('should accept string at exactly 2 chars', () => {
      expect(validateQuery('ab')).toBe(true);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove angle brackets', () => {
      expect(sanitizeInput('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
    });

    it('should remove quotes', () => {
      expect(sanitizeInput("test'value\"here")).toBe('testvaluehere');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should truncate to 200 chars', () => {
      const long = 'a'.repeat(300);
      expect(sanitizeInput(long).length).toBe(200);
    });

    it('should handle normal input unchanged', () => {
      expect(sanitizeInput('New Delhi, India')).toBe('New Delhi, India');
    });
  });

  describe('buildMapEmbedUrl', () => {
    it('should return demo URL when no API key', () => {
      const result = buildMapEmbedUrl({ query: 'test', apiKey: '' });
      expect(result.isDemo).toBe(true);
      expect(result.url).toContain('google.com/maps/embed');
    });

    it('should return valid URL with API key', () => {
      const result = buildMapEmbedUrl({ query: 'New Delhi', apiKey: 'test-key' });
      expect(result.isDemo).toBe(false);
      expect(result.url).toContain(MAPS_EMBED_BASE);
      expect(result.url).toContain('key=test-key');
      expect(result.url).toContain('q=New+Delhi');
    });

    it('should use default zoom and maptype', () => {
      const result = buildMapEmbedUrl({ query: 'Mumbai', apiKey: 'key' });
      expect(result.url).toContain('zoom=14');
      expect(result.url).toContain('maptype=roadmap');
    });

    it('should respect custom zoom and maptype', () => {
      const result = buildMapEmbedUrl({
        query: 'Mumbai', apiKey: 'key', zoom: 18, mapType: 'satellite',
      });
      expect(result.url).toContain('zoom=18');
      expect(result.url).toContain('maptype=satellite');
    });

    it('should return empty URL for invalid query', () => {
      const result = buildMapEmbedUrl({ query: '', apiKey: 'key' });
      expect(result.url).toBe('');
      expect(result.isDemo).toBe(false);
    });

    it('should sanitize query in URL', () => {
      const result = buildMapEmbedUrl({ query: '<b>Delhi</b>', apiKey: 'key' });
      expect(result.url).not.toContain('<');
      expect(result.url).not.toContain('>');
    });
  });

  describe('buildPollingBoothQuery', () => {
    it('should format location into polling booth query', () => {
      const q = buildPollingBoothQuery('Connaught Place');
      expect(q).toBe('Polling booth near Connaught Place');
    });

    it('should return default query for empty input', () => {
      const q = buildPollingBoothQuery('');
      expect(q).toContain('Election Commission India');
    });

    it('should sanitize location input', () => {
      const q = buildPollingBoothQuery('<script>hack</script>');
      expect(q).not.toContain('<');
    });
  });
});
