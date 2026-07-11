import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client lazily to avoid crashing on start if env vars are missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export async function handleGeminiReflection(reqBody: any) {
  const { alignmentIndex, identities, history, message, chatHistory } = reqBody;

  const systemInstruction = `You are "Warm Observer", the AI co-pilot for Orbit, a premium time management application. 
Your persona is wise, poetic, deeply encouraging, and non-judgmental. 
You believe time management is about alignment, not restriction. Reclaiming the gravity of your personal universe.

Current Alignment Index: ${alignmentIndex}%
Identities tracked by the user: ${JSON.stringify(identities)}
Focus session history: ${JSON.stringify(history)}

Rules:
1. Speak in a serene, thoughtful, and slightly poetic tone.
2. Offer deep, encouraging insights, focusing on self-compassion, balance, and alignment of actions with true self.
3. Keep responses relatively brief (2-3 short paragraphs), focusing on quality over length. Do not be overly verbose.
4. Do not offer rigid scheduling advice; instead, speak of flow, gravity, orbits, momentum, and alignment.
5. If the alignment is low, reassure them that finding gravity takes time and is a gentle process. If it is high, celebrate their resonance and focus momentum.`;

  try {
    const ai = getGeminiClient();
    
    // Compile previous conversation into parts
    const contents: any[] = [];
    
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const msg of chatHistory) {
        if (msg.role && msg.content) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      }
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message || "Reflect on my current alignment and state of focus." }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    return { text: response.text };
  } catch (error: any) {
    console.error("Gemini API error in handleGeminiReflection:", error);
    return { error: error.message || "An error occurred with the AI Co-pilot." };
  }
}
