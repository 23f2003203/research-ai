import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { isSafeUrl, canonicalizeUrl, extractDomain } from '../utils/url.js';
import { hashText } from '../utils/text.js';
import { logger } from '../utils/logger.js';
import { MODEL_CONFIG } from '../config/models.js';

class ExtractionService {
  /**
   * Fetches and extracts readable text and metadata from a web page.
   * @param {string} rawUrl
   * @returns {Promise<Object>} Extracted document information
   */
  async extractPage(rawUrl) {
    const canonical = canonicalizeUrl(rawUrl);
    if (!canonical) {
      return {
        url: rawUrl,
        canonicalUrl: rawUrl,
        status: 'failed',
        error: 'Invalid URL format',
      };
    }

    const safetyCheck = isSafeUrl(canonical);
    if (!safetyCheck.safe) {
      return {
        url: rawUrl,
        canonicalUrl: canonical,
        status: 'failed',
        error: `SSRF Security check blocked access: ${safetyCheck.reason}`,
      };
    }

    try {
      logger.info(`Fetching page for extraction: ${canonical}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(canonical, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ResearchAI/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          url: rawUrl,
          canonicalUrl: canonical,
          status: 'failed',
          error: `HTTP error ${response.status}: ${response.statusText}`,
        };
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        return {
          url: rawUrl,
          canonicalUrl: canonical,
          status: 'failed',
          error: `Unsupported content-type: ${contentType}`,
        };
      }

      const html = await response.text();
      if (!html || html.trim().length === 0) {
        return {
          url: rawUrl,
          canonicalUrl: canonical,
          status: 'failed',
          error: 'Empty response body received',
        };
      }

      // Parse with JSDOM
      const dom = new JSDOM(html, { url: canonical });
      const doc = dom.window.document;

      // Extract publication date meta tags if present
      let publishedAt = null;
      const dateMeta =
        doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
        doc.querySelector('meta[name="pubdate"]')?.getAttribute('content') ||
        doc.querySelector('meta[name="date"]')?.getAttribute('content');
      if (dateMeta) {
        const parsedDate = new Date(dateMeta);
        if (!isNaN(parsedDate.getTime())) {
          publishedAt = parsedDate;
        }
      }

      // Run Mozilla Readability
      const reader = new Readability(doc);
      const article = reader.parse();

      let extractedText = '';
      let title = doc.title || 'Untitled Document';

      if (article && article.textContent && article.textContent.trim().length > 100) {
        extractedText = article.textContent.trim();
        if (article.title) title = article.title;
      } else {
        // Fallback: extract text content directly from body, stripping script & style tags
        const scripts = doc.querySelectorAll('script, style, noscript, nav, footer, header');
        scripts.forEach((el) => el.remove());
        extractedText = (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
      }

      // Limit length to budget limit
      const maxLength = MODEL_CONFIG.budgets.maxExtractedTextLength;
      if (extractedText.length > maxLength) {
        extractedText = extractedText.slice(0, maxLength);
      }

      const wordCount = extractedText.split(/\s+/).length;
      const contentHash = hashText(extractedText);

      return {
        url: rawUrl,
        canonicalUrl: canonical,
        title,
        domain: extractDomain(canonical),
        publishedAt,
        retrievedAt: new Date(),
        contentHash,
        extractedText,
        qualitySignals: {
          wordCount,
          relevanceScore: 0.85,
          isPrimary: Boolean(publishedAt && wordCount > 300),
          hasAuthor: Boolean(article?.byline),
        },
        extractionStatus: extractedText.length > 50 ? 'success' : 'partial',
      };
    } catch (err) {
      logger.warn(`Failed extracting content from ${canonical}: ${err.message}`);
      return {
        url: rawUrl,
        canonicalUrl: canonical,
        status: 'failed',
        error: err.message,
      };
    }
  }
}

export const extractionService = new ExtractionService();
