import { logger } from '../utils/logger';

// @ts-ignore
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

interface GeminiModel {
  v: string;
  m: string;
}

export async function callGemini(prompt: string, isJson: boolean = false): Promise<string> {
  if (!API_KEY) {
    logger.warn('Gemini API key missing. Running in demo mode.');
    return isJson ? '[]' : 'This is a demo response. Please add an API key in env.js to see real AI results.';
  }

  const models: GeminiModel[] = [
    { v: 'v1beta', m: 'gemini-3.1-flash-lite-preview' },
    { v: 'v1beta', m: 'gemini-2.5-flash' },
    { v: 'v1beta', m: 'gemini-flash-latest' },
    { v: 'v1beta', m: 'gemini-pro' }
  ];

  let lastError = null;
  for (const config of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/${config.v}/models/${config.m}:generateContent?key=${API_KEY}`;
      const body: any = {
        contents: [{ parts: [{ text: prompt }] }]
      };
      
      if (isJson) {
        body.generationConfig = { response_mime_type: "application/json" };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.error) {
        logger.warn(`Model ${config.m} (${config.v}) failed: ${data.error.message}`);
        lastError = data.error.message;
        continue;
      }

      if (data.candidates && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch (e: any) {
      logger.error(`Error calling Gemini model ${config.m}:`, e);
      lastError = e.message;
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError}`);
}
