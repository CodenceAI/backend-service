import fetch from 'node-fetch';  // If needed

export async function getEmbeddingForQuery(query) {
  const response = await fetch('http://localhost:5000/embed', {  // Your Python embed server
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: query }),
  });

  const data = await response.json();
  return data.embedding;
}
