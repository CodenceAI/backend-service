import fs from 'fs';
import path from 'path';
import { getEmbeddingForQuery } from '../utils/embeddingClient'; // We’ll implement this next
import { cosineSimilarity } from '../utils/cosineSimilarity'; // We’ll implement this next
import { askGemini , getGeminiEmbedding } from '../utils/geminiClient'; // We’ll implement this next

export async function searchRepoService(req, res, next) {
  try {
    const { repoName, query } = req.body;

    if (!repoName || !query) {
      return res.status(400).json({ error: 'repoName and query are required' });
    }

    const analysisPath = path.resolve('./analyses', `${repoName}-full-analysis.json`);
    if (!fs.existsSync(analysisPath)) {
      return res.status(404).json({ error: 'Analysis not found for this repo' });
    }

    const analysisRaw = fs.readFileSync(analysisPath, 'utf-8');
    const analysis = JSON.parse(analysisRaw);

    // Step 5: Get query embedding
    const queryEmbedding = await getGeminiEmbedding(query);

    const queryEmbeddingValues = queryEmbedding[0].values;

    // Step 6: Compute cosine similarities
    const scoredBlocks = analysis.map(block => {
      const score = cosineSimilarity(queryEmbeddingValues, block.embedding[0].values);
      
      // Exclude embedding from the response
      const { embedding, ...rest } = block;
      return { ...rest, score };
    });

    const topMatches = scoredBlocks.slice(0, 5);

  // Step 7: Get AI explanation from Gemini
    const explanation = await askGemini(query, topMatches);

  // Step 8: Return response
    res.json({
        repoName,
        query,
        explanation,
    });

    } catch (err) {
    next(err);
    }
};
