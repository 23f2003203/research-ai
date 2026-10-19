import { URL } from 'url';

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'gclsrc',
  'dclid',
  'zanpid',
  'msclkid',
  '_hsenc',
  '_hsmi',
  'mc_cid',
  'mc_eid',
]);

const BLOCKED_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254', // AWS / Cloud metadata
  'metadata.google.internal',
]);

const PRIVATE_IP_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^fc00:/i,
  /^fe80:/i,
];

/**
 * Normalizes and canonicalizes a URL for deduplication and consistent storage.
 */
export function canonicalizeUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl.trim());

    // Only allow HTTP and HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    // Lowercase hostname
    parsed.hostname = parsed.hostname.toLowerCase();

    // Remove hash/fragment
    parsed.hash = '';

    // Remove default ports
    if ((parsed.protocol === 'http:' && parsed.port === '80') ||
        (parsed.protocol === 'https:' && parsed.port === '443')) {
      parsed.port = '';
    }

    // Strip tracking parameters
    const keysToDelete = [];
    for (const key of parsed.searchParams.keys()) {
      if (TRACKING_PARAMS.has(key.toLowerCase()) || key.startsWith('utm_')) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      parsed.searchParams.delete(key);
    }

    // Sort search parameters for deterministic URL
    parsed.searchParams.sort();

    // Strip trailing slash from pathname if not root
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    return parsed.toString();
  } catch (err) {
    return null;
  }
}

/**
 * Validates whether a URL is safe to fetch (protects against SSRF and local intranet probing).
 */
export function isSafeUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: 'Invalid protocol: only HTTP/HTTPS allowed' };
    }

    const hostname = parsed.hostname.toLowerCase();

    if (BLOCKED_HOSTS.has(hostname)) {
      return { safe: false, reason: 'Blocked private host' };
    }

    for (const pattern of PRIVATE_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return { safe: false, reason: 'Blocked private IP range' };
      }
    }

    return { safe: true, domain: hostname };
  } catch (err) {
    return { safe: false, reason: 'Malformed URL' };
  }
}

/**
 * Extracts clean domain name from URL.
 */
export function extractDomain(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    return parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    return 'unknown-source';
  }
}
