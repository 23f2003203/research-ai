import { describe, it, expect } from 'vitest';
import { canonicalizeUrl, isSafeUrl, extractDomain } from '../../src/utils/url.js';

describe('URL Canonicalization and Security', () => {
  it('canonicalizes URLs by removing tracking params, hashes, and default ports', () => {
    const raw = 'https://Example.COM:443/research/article/?utm_source=twitter&utm_medium=social&b=2&a=1#section-1';
    const canonical = canonicalizeUrl(raw);
    expect(canonical).toBe('https://example.com/research/article?a=1&b=2');
  });

  it('rejects unsupported protocols', () => {
    expect(canonicalizeUrl('ftp://example.com')).toBeNull();
    expect(canonicalizeUrl('javascript:alert(1)')).toBeNull();
    expect(canonicalizeUrl('file:///etc/passwd')).toBeNull();
  });

  it('detects SSRF risk on localhost and private networks', () => {
    expect(isSafeUrl('http://localhost:8080/admin').safe).toBe(false);
    expect(isSafeUrl('http://127.0.0.1:3000').safe).toBe(false);
    expect(isSafeUrl('http://192.168.1.1').safe).toBe(false);
    expect(isSafeUrl('http://10.0.0.5/api').safe).toBe(false);
    expect(isSafeUrl('http://169.254.169.254/latest/meta-data/').safe).toBe(false);
    expect(isSafeUrl('https://example.com/research').safe).toBe(true);
  });

  it('extracts clean domain name', () => {
    expect(extractDomain('https://www.nature.com/articles/123')).toBe('nature.com');
    expect(extractDomain('https://arxiv.org/abs/2301.001')).toBe('arxiv.org');
  });
});
