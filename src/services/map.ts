/**
 * Map service module for Google Maps integration.
 * Handles polling booth search using Google Maps Embed API.
 * Supports demo mode when no API key is available.
 */

import { logger } from '../utils/logger';

/** Configuration for map embed generation */
export interface MapEmbedConfig {
  query: string;
  apiKey: string;
  zoom?: number;
  mapType?: 'roadmap' | 'satellite';
}

/** Result of a map embed URL generation */
export interface MapEmbedResult {
  url: string;
  isDemo: boolean;
}

const MAPS_EMBED_BASE = 'https://www.google.com/maps/embed/v1/search';
const DEFAULT_ZOOM = 14;
const DEFAULT_MAP_TYPE: MapEmbedConfig['mapType'] = 'roadmap';

/**
 * Validates that a search query is non-empty and reasonable.
 * @param query - The search query string
 * @returns True if query is valid
 */
export function validateQuery(query: string): boolean {
  if (!query || typeof query !== 'string') return false;
  const trimmed = query.trim();
  return trimmed.length >= 2 && trimmed.length <= 500;
}

/**
 * Sanitizes user input to prevent injection in URL parameters.
 * @param input - Raw user input string
 * @returns Sanitized string safe for URL encoding
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>'"]/g, '')
    .trim()
    .substring(0, 200);
}

/**
 * Builds a Google Maps Embed API URL for searching polling booths.
 * @param config - Map embed configuration
 * @returns MapEmbedResult with the URL and demo status
 */
export function buildMapEmbedUrl(config: MapEmbedConfig): MapEmbedResult {
  const { apiKey, zoom = DEFAULT_ZOOM, mapType = DEFAULT_MAP_TYPE } = config;
  const query = sanitizeInput(config.query);

  if (!apiKey) {
    logger.warn('No Google Maps API key provided. Using demo embed.');
    return {
      url: `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3!2d77.2090!3d28.6139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0!2s0x0!5e0!3m2!1sen!2sin`,
      isDemo: true,
    };
  }

  if (!validateQuery(query)) {
    logger.error('Invalid map search query.');
    return { url: '', isDemo: false };
  }

  const params = new URLSearchParams({
    key: apiKey,
    q: query,
    zoom: String(zoom),
    maptype: String(mapType),
  });

  return {
    url: `${MAPS_EMBED_BASE}?${params.toString()}`,
    isDemo: false,
  };
}

/**
 * Generates a polling booth search query from a location string.
 * @param location - User-provided location
 * @returns Formatted search query
 */
export function buildPollingBoothQuery(location: string): string {
  const sanitized = sanitizeInput(location);
  if (!sanitized) return 'Polling booth near Election Commission India';
  return `Polling booth near ${sanitized}`;
}

export { DEFAULT_ZOOM, DEFAULT_MAP_TYPE, MAPS_EMBED_BASE };
