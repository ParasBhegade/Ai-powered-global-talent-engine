const { pipeline } = require('@xenova/transformers');

// Lazy load the pipeline so we don't block startup
let extractor = null;

async function getExtractor() {
  if (!extractor) {
    // We use the default model 'Xenova/all-MiniLM-L6-v2' which is lightweight and fast
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true, // Uses less memory
    });
  }
  return extractor;
}

/**
 * Embeds a text string into a dense vector.
 * @param {string} text - The input text to embed.
 * @returns {Promise<number[]>} - The embedding vector.
 */
async function embedText(text) {
  if (!text || text.trim() === '') return [];
  try {
    const extract = await getExtractor();
    const output = await extract(text, { pooling: 'mean', normalize: true });
    // Convert Tensor data (Float32Array) to a regular Array
    return Array.from(output.data);
  } catch (err) {
    console.error('Error computing embedding:', err);
    return [];
  }
}

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} - Similarity score between -1 and 1
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  
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

module.exports = {
  embedText,
  cosineSimilarity
};
