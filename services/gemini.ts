import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

let chatSession: Chat | null = null;
let aiClient: GoogleGenAI | null = null;

// Initialize the API only when needed
const getAIClient = () => {
  if (aiClient) return aiClient;
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing!");
    return null;
  }
  aiClient = new GoogleGenAI({ apiKey });
  return aiClient;
};

export const initializeChat = async () => {
  const ai = getAIClient();
  if (!ai) return;

  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are Nexus, an elite AI gaming companion. 
      Persona: Cool, tech-savvy, esports expert.
      Slang: Use appropriately (GG, EZ, nerf, buff, OP, AFK).
      Format: Concise chat messages (under 200 words).
      `,
    },
  });
};

// Standard conversational chat
export const sendMessageToAI = async (userMessage: string): Promise<string> => {
  if (!chatSession) {
    await initializeChat();
  }

  if (!chatSession) {
    return "Error: Could not connect to Nexus AI mainframe (API Key missing).";
  }

  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({
      message: userMessage
    });
    return response.text || "I'm lagging... (No response text)";
  } catch (error) {
    console.error("AI Error:", error);
    chatSession = null;
    return "Connection lost. Reconnecting to mainframe... (Error generating response)";
  }
};

// Generate Image using gemini-2.5-flash-image
export const generateAIImage = async (prompt: string): Promise<string | null> => {
  const ai = getAIClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        // No responseMimeType for this model
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};

// Strategy Thinking Mode using Thinking Config
export const getAIStrategy = async (prompt: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Offline";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a deep strategic analysis for: ${prompt}`,
      config: {
        thinkingConfig: { thinkingBudget: 2048 }, // Enable thinking for deep reasoning
      }
    });
    return response.text || "Strategy formulation failed.";
  } catch (error) {
    console.error("Strategy Error:", error);
    return "Error calculating strategy.";
  }
};

// Real-time News using Search Grounding
export const getAINews = async (topic: string): Promise<{ text: string, sources: { title: string, uri: string }[] }> => {
  const ai = getAIClient();
  if (!ai) return { text: "AI Offline", sources: [] };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `What is the latest news or patch notes regarding: ${topic}?`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const sources: { title: string, uri: string }[] = [];
    
    // Extract grounding chunks
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    return { 
      text: response.text || "No news found.",
      sources
    };
  } catch (error) {
    console.error("News Error:", error);
    return { text: "Failed to fetch news feed.", sources: [] };
  }
};