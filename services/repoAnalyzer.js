import axios from 'axios';
import fs from 'fs';
import path from 'path';
import simpleGit from 'simple-git';
import pLimit from 'p-limit';
import os from 'os';
import { extractCodeBlocks } from '../utils/extractCodeBlocks'; // We’ll implement this next

async function generateEmbedding(text) {
  const EMBEDDING_API_URL = process.env.EMBEDDING_API_URL || 'http://127.0.0.1:5000';
  const response = await axios.post(`${EMBEDDING_API_URL}/embed`, { text });
  return response.data.embedding;
}

export async function analyzeRepoService(req, res, next) {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ error: 'repoUrl is required' });

    const repoName = repoUrl.split('/').pop().replace('.git', '');
    const tempDir = path.join(os.tmpdir(), `codence-${Date.now()}`);
    console.log(`Cloning into temp dir: ${tempDir}`);

    const git = simpleGit();

    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    await git.clone(repoUrl, tempDir);

    const allBlocks = [];

    function recurse(currentDir) {
      const entries = fs.readdirSync(currentDir);
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry);
        const stats = fs.lstatSync(fullPath);

        if (stats.isDirectory()) {
          recurse(fullPath);
        } else if (/\.(py|js|ts)$/.test(entry)) {
          const blocks = extractCodeBlocks(fullPath);

          blocks.forEach(block => {
            allBlocks.push({
              path: path.relative(tempDir, fullPath),
              blockName: block.blockName,
              content: block.content,
              embedding: [], // placeholder, will be filled later
            });
          });
        }
      }
    }

    recurse(tempDir);

    // Generate embeddings per block
    const limit = pLimit(3);

    const allBlocksWithEmbeddings = await Promise.all(
      allBlocks.map(block =>
        limit(async () => ({
          ...block,
          embedding: await generateEmbedding(block.content),
        }))
      )
    );

    const analysis = {
      repoUrl,
      repoName,
      totalBlocks: allBlocksWithEmbeddings.length,
      sampleBlocks: allBlocksWithEmbeddings.slice(0, 5),
      timestamp: new Date().toISOString(),
    };

    const fullAnalysisPath = path.resolve('./analyses', `${repoName}-full-analysis.json`);
    fs.writeFileSync(fullAnalysisPath, JSON.stringify(allBlocksWithEmbeddings, null, 2));

    // Save analysis JSON
    const analysisPath = path.resolve('./analyses', `${repoName}-analysis.json`);
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));

    res.json(analysis);
  } catch (err) {
    next(err);
  }
};