import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildApiUrl,
  buildRequestBody,
  extractResponseText,
  getDemoResponse,
  callGemini,
  GEMINI_MODEL,
  GEMINI_API_VERSION,
} from './ai';

describe('AI Service', () => {
  describe('constants', () => {
    it('should use gemini-flash-latest model', () => {
      expect(GEMINI_MODEL).toBe('gemini-flash-latest');
    });

    it('should use v1beta API version', () => {
      expect(GEMINI_API_VERSION).toBe('v1beta');
    });
  });

  describe('buildApiUrl', () => {
    it('should construct valid Gemini API URL', () => {
      const url = buildApiUrl('test-key-123');
      expect(url).toContain('generativelanguage.googleapis.com');
      expect(url).toContain('v1beta');
      expect(url).toContain('gemini-flash-latest');
      expect(url).toContain('key=test-key-123');
    });

    it('should include generateContent endpoint', () => {
      const url = buildApiUrl('abc');
      expect(url).toContain(':generateContent');
    });
  });

  describe('buildRequestBody', () => {
    it('should build basic request body with prompt', () => {
      const body = buildRequestBody('Hello', false);
      expect(body.contents).toHaveLength(1);
      expect(body.contents[0].parts[0].text).toBe('Hello');
      expect(body.generationConfig).toBeUndefined();
    });

    it('should add JSON config when isJson is true', () => {
      const body = buildRequestBody('Give JSON', true);
      expect(body.generationConfig).toBeDefined();
      expect(body.generationConfig!.response_mime_type).toBe('application/json');
    });
  });

  describe('extractResponseText', () => {
    it('should extract text from valid response', () => {
      const data = {
        candidates: [{ content: { parts: [{ text: 'Answer here' }] } }],
      };
      expect(extractResponseText(data)).toBe('Answer here');
    });

    it('should return null when response has error', () => {
      const data = { error: { message: 'Bad request' } };
      expect(extractResponseText(data)).toBeNull();
    });

    it('should return null when candidates are empty', () => {
      expect(extractResponseText({})).toBeNull();
    });

    it('should return null when nested structure is missing', () => {
      const data = { candidates: [{}] };
      expect(extractResponseText(data as any)).toBeNull();
    });
  });

  describe('getDemoResponse', () => {
    it('should return empty array string for JSON mode', () => {
      expect(getDemoResponse(true)).toBe('[]');
    });

    it('should return human-readable message for non-JSON mode', () => {
      const response = getDemoResponse(false);
      expect(response).toContain('Demo mode');
      expect(response).toContain('API key');
    });
  });

  describe('callGemini', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('should return demo response when no API key is provided', async () => {
      const result = await callGemini('test prompt', false, '');
      expect(result).toContain('Demo mode');
    });

    it('should return demo JSON response when no API key and isJson', async () => {
      const result = await callGemini('test', true, '');
      expect(result).toBe('[]');
    });

    it('should return demo response when apiKey is undefined', async () => {
      const result = await callGemini('test');
      expect(result).toContain('Demo mode');
    });

    it('should call fetch with correct parameters when API key exists', async () => {
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: 'AI answer' }] } }],
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      }));

      const result = await callGemini('Hello', false, 'real-key');
      expect(result).toBe('AI answer');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw when API returns an error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ error: { message: 'Rate limited' } }),
      }));

      await expect(callGemini('test', false, 'key')).rejects.toThrow('Rate limited');
    });

    it('should throw on network failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));

      await expect(callGemini('test', false, 'key')).rejects.toThrow('Network down');
    });
  });
});
