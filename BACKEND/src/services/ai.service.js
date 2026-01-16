import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("Missing GOOGLE_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Same model as your Python code
const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
});

export async function generateSummaryFromPitch(pitch) {
  if (!pitch || pitch.length < 30) {
    const err = new Error("Pitch description too short for AI summary");
    err.status = 400;
    throw err;
  }

  const prompt = `
You are an analyst reviewing startup applications.

Return ONLY valid JSON.
No markdown.
No explanations.
No extra text.

Schema:
{
  "bullets": string[],
  "strengths": string[],
  "risks": string[]
}

Rules:
- bullets: 3–5 short points describing what the startup does
- strengths: 2–4 concrete positives
- risks: 2–4 realistic concerns

Startup pitch:
${pitch}
  `.trim();

  const result = await model.generateContent(prompt);
  const response = result.response;

  const text = response.text();
  if (!text) {
    const err = new Error("Empty response from Gemini");
    err.status = 502;
    throw err;
  }

  const parsed = safeJsonParse(text);
  if (!parsed) {
    const err = new Error("Gemini returned invalid JSON");
    err.status = 502;
    throw err;
  }

  return {
    bullets: Array.isArray(parsed.bullets) ? parsed.bullets.map(String) : [],
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
    risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
    model: "gemini-flash-latest",
  };
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    // Gemini sometimes wraps text; extract JSON safely
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
