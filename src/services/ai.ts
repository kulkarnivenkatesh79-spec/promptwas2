/**
 * Gemini AI service module.
 * Uses only gemini-flash-latest. Supports demo mode when API key is absent.
 */

import { logger } from '../utils/logger';

const GEMINI_MODEL = 'gemini-flash-latest';
const GEMINI_API_VERSION = 'v1beta';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com';

export interface GeminiRequestBody {
  contents: { parts: { text: string }[] }[];
  generationConfig?: { response_mime_type: string };
}

export interface GeminiResponse {
  candidates?: { content: { parts: { text: string }[] } }[];
  error?: { message: string };
}

export function buildApiUrl(apiKey: string): string {
  return `${GEMINI_BASE_URL}/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
}

export function buildRequestBody(prompt: string, isJson: boolean): GeminiRequestBody {
  const body: GeminiRequestBody = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  if (isJson) {
    body.generationConfig = { response_mime_type: 'application/json' };
  }
  return body;
}

export function extractResponseText(data: GeminiResponse): string | null {
  if (data.error) {
    return null;
  }
  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }
  return null;
}

export function getDemoResponse(isJson: boolean): string {
  if (isJson) {
    return '[]';
  }
  return 'Demo mode: AI features require an API key. Add your Gemini API key to env.js to enable live responses.';
}

export async function callGemini(
  prompt: string,
  isJson: boolean = false,
  apiKey?: string,
): Promise<string> {
  const key = apiKey || '';

  if (!key) {
    logger.warn('No Gemini API key provided. Returning demo response.');
    return getDemoResponse(isJson);
  }

  const url = buildApiUrl(key);
  const body = buildRequestBody(prompt, isJson);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data: GeminiResponse = await response.json();
    const text = extractResponseText(data);

    if (text !== null) {
      return text;
    }

    const errorMsg = data.error?.message || 'Unknown API error';
    logger.error(`Gemini API error: ${errorMsg}`);
    throw new Error(errorMsg);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Network error';
    logger.error(`callGemini failed: ${message}`);
    throw new Error(message);
  }
}

export { GEMINI_MODEL, GEMINI_API_VERSION };
