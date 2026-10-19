import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { canonicalizeUrl, isSafeUrl, extractDomain } from '../utils/url.js';

class TavilyService {
  constructor() {
    this.apiKey = env.TAVILY_API_KEY;
    this.baseUrl = 'https://api.tavily.com';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Performs live web search using Tavily API.
   * @param {Object} options
   * @param {string} options.query - The search query
   * @param {number} options.maxResults - Max search results to fetch
   * @param {Array<string>} options.includeDomains - Optional list of domains to filter by
   * @param {Array<string>} options.excludeDomains - Optional list of domains to exclude
   * @returns {Promise<Array<Object>>} Normalized search results
   */
  async search({ query, maxResults = 5, includeDomains = [], excludeDomains = [] }) {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return [];
    }

    if (!this.isConfigured()) {
      logger.warn('Tavily API key is not configured. Live search requires TAVILY_API_KEY.');
      throw new Error(
        'Tavily API key is not configured. Please set TAVILY_API_KEY in your environment variables to perform live web research.'
      );
    }

    try {
      logger.info(`Executing Tavily search for: "${query}"`, { maxResults });

      const payload = {
        api_key: this.apiKey,
        query: query.trim(),
        search_depth: 'advanced',
        include_images: false,
        include_answer: false,
        max_results: maxResults,
        ...(includeDomains.length > 0 ? { include_domains: includeDomains } : {}),
        ...(excludeDomains.length > 0 ? { exclude_domains: excludeDomains } : {}),
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(`Tavily search API error [${response.status}]: ${errorBody.error || response.statusText}`);
      }

      const data = await response.json();
      const rawResults = data.results || [];

      // Normalize, validate SSRF, and deduplicate results
      const normalizedResults = [];
      const seenUrls = new Set();

      for (const item of rawResults) {
        if (!item.url) continue;

        const canonical = canonicalizeUrl(item.url);
        if (!canonical || seenUrls.has(canonical)) continue;

        const safetyCheck = isSafeUrl(canonical);
        if (!safetyCheck.safe) {
          logger.warn(`Skipping unsafe URL from search results: ${canonical} (${safetyCheck.reason})`);
          continue;
        }

        seenUrls.add(canonical);
        normalizedResults.push({
          title: item.title || 'Untitled Source',
          url: item.url,
          canonicalUrl: canonical,
          domain: extractDomain(canonical),
          snippet: item.content || '',
          score: item.score || 0.8,
          publishedDate: item.published_date || null,
        });
      }

      logger.info(`Tavily search returned ${normalizedResults.length} validated unique sources for "${query}"`);
      return normalizedResults;
    } catch (err) {
      logger.error(`Tavily search failed for query "${query}"`, err);
      throw err;
    }
  }
}

export const tavilyService = new TavilyService();
