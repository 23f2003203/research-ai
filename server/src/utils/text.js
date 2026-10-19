import crypto from 'crypto';

/**
 * Computes sha256 hash of a string.
 */
export function hashText(text) {
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
}

/**
 * Splits text into semantic chunks with overlap, breaking on paragraph or sentence boundaries.
 * @param {string} text - Raw input text
 * @param {number} chunkSize - Max characters per chunk (approx. 500-800 tokens)
 * @param {number} overlap - Overlapping characters between successive chunks
 * @returns {Array<{ chunkIndex: number, text: string, sectionTitle?: string }>}
 */
export function chunkText(text, chunkSize = 1200, overlap = 150) {
  if (!text || typeof text !== 'string') return [];

  const cleanText = text.replace(/\r\n/g, '\n').trim();
  if (cleanText.length <= chunkSize) {
    return [{ chunkIndex: 0, text: cleanText, sectionTitle: '' }];
  }

  const chunks = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < cleanText.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex >= cleanText.length) {
      const remainingChunk = cleanText.slice(startIndex).trim();
      if (remainingChunk) {
        chunks.push({ chunkIndex, text: remainingChunk, sectionTitle: '' });
      }
      break;
    }

    // Try to find natural break point (paragraph break, sentence end, or whitespace)
    const searchSlice = cleanText.slice(startIndex, endIndex);
    let breakPoint = searchSlice.lastIndexOf('\n\n');

    if (breakPoint === -1 || breakPoint < chunkSize * 0.5) {
      breakPoint = searchSlice.lastIndexOf('. ');
      if (breakPoint !== -1) {
        breakPoint += 1; // Include period
      }
    }

    if (breakPoint === -1 || breakPoint < chunkSize * 0.4) {
      breakPoint = searchSlice.lastIndexOf(' ');
    }

    if (breakPoint === -1) {
      breakPoint = chunkSize;
    }

    const chunkContent = cleanText.slice(startIndex, startIndex + breakPoint).trim();
    if (chunkContent) {
      chunks.push({ chunkIndex, text: chunkContent, sectionTitle: '' });
      chunkIndex++;
    }

    // Step forward by breakPoint minus overlap
    startIndex += Math.max(breakPoint - overlap, 50);
  }

  return chunks;
}

/**
 * Computes cosine similarity between two numerical vectors.
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Truncates text safely without cutting mid-word.
 */
export function truncate(text, maxLength = 200) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}
