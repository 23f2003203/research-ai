import { describe, it, expect } from 'vitest';
import { chunkText, cosineSimilarity, hashText } from '../../src/utils/text.js';

describe('Text Processing & Vector Utilities', () => {
  it('chunks text cleanly with paragraph or sentence boundaries and overlap', () => {
    const text = 'First paragraph explaining the architecture.\n\nSecond paragraph detailing benchmark results and metrics across nodes.\n\nThird paragraph summarizing key findings and future outlook.';
    const chunks = chunkText(text, 80, 20);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[0].text.length).toBeGreaterThan(0);
  });

  it('computes cosine similarity accurately', () => {
    const vecA = [1, 0, 0];
    const vecB = [1, 0, 0];
    const vecC = [0, 1, 0];
    const vecD = [0.7071, 0.7071, 0];

    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0, 4);
    expect(cosineSimilarity(vecA, vecC)).toBeCloseTo(0.0, 4);
    expect(cosineSimilarity(vecA, vecD)).toBeCloseTo(0.7071, 3);
  });

  it('produces consistent SHA256 hashes', () => {
    const hash1 = hashText('Autonomous Research AI');
    const hash2 = hashText('Autonomous Research AI');
    const hash3 = hashText('Different Text');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });
});
