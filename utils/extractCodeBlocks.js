import fs from 'fs';
import path from 'path';

export function extractCodeBlocks(filePath) {
  const blocks = [];
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  if (filePath.endsWith('.py')) {
    const regex = /^def\s+\w+\(.*?\):[\s\S]*?(?=^def\s+\w+\(|\Z)/gm;
    let match;
    while ((match = regex.exec(fileContent)) !== null) {
      const firstLine = match[0].split('\n')[0].trim();
      blocks.push({
        blockName: firstLine,
        content: match[0].trim(),
      });
    }
  } else if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
    const regex = /(?:export\s+)?(?:async\s+)?function\s+\w+\s*\(.*?\)\s*{[\s\S]*?}|(?:export\s+)?(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\(?[\w\s,]*\)?\s*=>\s*{[\s\S]*?}|(?:export\s+)?(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?function\s*\(.*?\)\s*{[\s\S]*?}/gm;

    let match;
    while ((match = regex.exec(fileContent)) !== null) {
        const firstLine = match[0].split('\n')[0].trim();
        blocks.push({
        blockName: firstLine,
        content: match[0].trim(),
        });
    }
    }

  return blocks;
}
