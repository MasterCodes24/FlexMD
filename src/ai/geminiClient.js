import fs from "node:fs";
import path from "node:path";

// Auto-load .env without requiring external dependencies (works on Node v20/v22/v24)
try {
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile();
  } else {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split(/\r?\n/).forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || "";
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          if (!process.env[key]) process.env[key] = value.trim();
        }
      });
    }
  }
} catch {
  // Ignore if .env is missing
}

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Executes a Gemini prompt with a strict JSON schema enforcement.
 * Works seamlessly with Google GenAI SDK or direct REST fallback.
 * 
 * @param {Object} options
 * @param {string} options.systemInstruction
 * @param {string} options.userPrompt
 * @param {Object} options.jsonSchema - OpenAPI/Gemini compatible schema
 * @param {string} [options.model] - Model name (e.g. gemini-2.5-flash)
 * @param {Object} [options.audioData] - Optional audio data { mimeType: string, base64: string }
 * @returns {Promise<Object>} Parsed JSON response guaranteed to match schema
 */
export async function generateStructuredJson({
  systemInstruction,
  userPrompt,
  jsonSchema,
  model = DEFAULT_MODEL,
  audioData = null
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error(
      "[ClinicFlow AI] Missing GEMINI_API_KEY. Please set your key in .env file (e.g. GEMINI_API_KEY=AIza...)"
    );
  }

  // Attempt using modern @google/genai SDK first
  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });
    
    const parts = [];
    if (audioData && audioData.base64) {
      parts.push({
        inlineData: {
          mimeType: audioData.mimeType || "audio/mp3",
          data: audioData.base64
        }
      });
    }
    parts.push({ text: userPrompt });

    const response = await ai.models.generateContent({
      model,
      contents: parts,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: jsonSchema,
        temperature: 0.1, // Low temperature for high extraction fidelity & zero creativity
      }
    });

    const text = response.text?.trim() || "{}";
    return JSON.parse(text);
  } catch {
    // If @google/genai fails or is not installed yet, use robust direct REST call
    return await generateViaRestApi({
      apiKey,
      model,
      systemInstruction,
      userPrompt,
      jsonSchema,
      audioData
    });
  }
}

/**
 * Direct REST implementation for maximum portability and zero-dependency reliability.
 */
async function generateViaRestApi({ apiKey, model, systemInstruction, userPrompt, jsonSchema, audioData }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const parts = [];
  if (audioData && audioData.base64) {
    parts.push({
      inline_data: {
        mime_type: audioData.mimeType || "audio/mp3",
        data: audioData.base64
      }
    });
  }
  parts.push({ text: userPrompt });

  const payload = {
    contents: [
      {
        role: "user",
        parts
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: jsonSchema,
      temperature: 0.1
    }
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[Gemini REST Error ${response.status}]: ${errorText}`);
  }

  const result = await response.json();
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("[Gemini API] Empty response returned by model.");
  }

  return JSON.parse(rawText.trim());
}
