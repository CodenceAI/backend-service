import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Google Generative AI client
const googleAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const geminiConfig = {
  temperature: 0.2,
  topP: 1,
  topK: 1,
  maxOutputTokens: 1024,
};

/**
 * Ask Gemini with a user query and relevant code blocks.
 * @param {string} query - User's question
 * @param {Array<{path: string, blockName: string, content: string}>} codeBlocks - Relevant code blocks
 * @returns {Promise<string>} - Explanation from Gemini
 */
export async function askGemini(query, codeBlocks = []) {
  try {
    const geminiModel = googleAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      geminiConfig
    });

const prompt = `
You are an expert code assistant. The user asked: "${query}"

Here are the relevant code blocks:
${codeBlocks
  .map(b => `File: ${b.path}, Function: ${b.blockName}\n${b.content}`)
  .join("\n\n")}

Instructions:
1. Provide a JSON response ONLY, strictly following this schema:
{
  "answer": "Explain how the code solves or is relevant to the query in concise terms",
  "references": [
    {
      "file": "file path",
      "function": "function name",
      "excerpt": "a short snippet or description of the relevant code"
    }
  ]
}
2. Include all code blocks that are relevant in the "references" array.
3. Do not include any extra text outside the JSON.

Generate the response now.
`;

    const result = await geminiModel.generateContent(prompt);
    let responseText = result.response.text().trim();

    // Strip ```json or ``` if present
    responseText = responseText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();

    try {
      const jsonResponse = JSON.parse(responseText);
      return jsonResponse;
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON response:", responseText);
      throw parseErr;
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}