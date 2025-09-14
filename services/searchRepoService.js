import fs from 'fs';
import path from 'path';
import { getEmbeddingForQuery } from '../utils/embeddingClient'; // We’ll implement this next
import { cosineSimilarity } from '../utils/cosineSimilarity'; // We’ll implement this next

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

    // Step 5: Get query embedding (placeholder)
    const queryEmbedding = await getEmbeddingForQuery(query);

    // Step 6: Compute cosine similarities
    const scoredBlocks = analysis.map(block => {
      const score = cosineSimilarity(queryEmbedding, block.embedding);
      
      // Exclude embedding from the response
      const { embedding, ...rest } = block;
      return { ...rest, score };
    });

    scoredBlocks.sort((a, b) => b.score - a.score);

    res.json({
      repoName,
      query,
      topMatches: scoredBlocks.slice(0, 5),
    });
  } catch (err) {
    next(err);
  }
};
