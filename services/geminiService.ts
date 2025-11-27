import { GoogleGenAI } from "@google/genai";
import { Ticket } from "../types";

const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceError
  }
  return '';
};

const apiKey = getApiKey();

// Initialize only if key exists (handled gracefully in UI)
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeTicket = async (ticket: Ticket): Promise<string> => {
  if (!ai) {
    return "API Key not configured. AI analysis unavailable.";
  }

  try {
    const historyText = ticket.history
      .map(h => `[${h.date.split('T')[0]} by ${h.userRole}]: ${h.description}`)
      .join('\n');

    const prompt = `
      Analyze this maintenance ticket for a manufacturing context.
      
      Title: ${ticket.title}
      Type: ${ticket.type}
      Priority: ${ticket.priority}
      Description: ${ticket.description}
      
      History Logs:
      ${historyText}
      
      Please provide:
      1. A brief summary of the issue status.
      2. Potential root causes based on the description.
      3. Recommended next steps for the engineering team.
      
      Keep it concise and professional.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return "Failed to generate analysis. Please try again later.";
  }
};