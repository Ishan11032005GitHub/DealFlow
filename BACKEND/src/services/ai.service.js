import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) throw new Error("Missing GOOGLE_API_KEY");

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
});

export async function generateSummaryFromPitch(pitch) {
  if (!pitch || pitch.length < 30) {
    const err = new Error("Pitch too short");
    err.status = 400;
    throw err;
  }

  const prompt = `
Return ONLY valid JSON.

{
  "bullets": string[],
  "strengths": string[],
  "risks": string[]
}

Startup pitch:
${pitch}
`.trim();

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
}
