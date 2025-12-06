import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message } from '../types';

let chatSession: Chat | null = null;

// Initialize the API only when needed
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing!");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const initializeChat = async () => {
  const ai = getAIClient();
  if (!ai) return;

  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are Nexus, an elite AI gaming companion integrated into a chat platform. 
      Your persona is cool, tech-savvy, and knowledgeable about all video games, esports, and hardware.
      You use gamer slang appropriately (GG, EZ, nerf, buff, OP, AFK) but remain helpful and clear.
      Keep responses concise and formatted for a chat interface (under 200 words usually).
      If a user asks for strategy, be specific. If they ask about lore, be immersive.
      `,
    },
  });
};

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