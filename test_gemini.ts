import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
console.log("Checking API Key exists:", !!apiKey);

if (!apiKey) {
  console.log("API Key is missing!");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function run() {
  try {
    console.log("Calling Gemini API...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Hello! Answer in 5 words."
    });
    console.log("Response text:", response.text);
  } catch (err: any) {
    console.error("Gemini API call failed:", err.message);
  }
}

run();
