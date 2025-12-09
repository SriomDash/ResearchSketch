import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse, ReasoningMode } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is not defined in process.env");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

// Define the comprehensive schema that covers all modes
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    reasoning_map: {
      type: Type.OBJECT,
      properties: {
        nodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["empirical", "causal", "normative", "emotional", "anecdotal", "undefined"] }
            },
            required: ["id", "text", "type"]
          }
        },
        links: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              from: { type: Type.STRING },
              to: { type: Type.STRING },
              strength: { type: Type.STRING, enum: ["supported", "weak", "undefined", "circular"] }
            },
            required: ["from", "to", "strength"]
          }
        }
      },
      required: ["nodes", "links"]
    },
    fragile_points: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          node_id: { type: Type.STRING },
          why_fragile: { type: Type.STRING }
        },
        required: ["node_id", "why_fragile"]
      }
    },
    missing_variables: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    rewritten_reasoning: { type: Type.STRING, description: "Only for rewrite mode" },
    changes_made: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Only for rewrite mode" },
    teaching_points: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Only for teach mode" }
  },
  required: ["reasoning_map", "fragile_points", "missing_variables"]
};

export const analyzeReasoning = async (
  inputText: string,
  mode: ReasoningMode
): Promise<AnalysisResponse> => {
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const model = "gemini-2.5-flash";
  
  let userPrompt = `Input Text: "${inputText}"\nMode: ${mode}\n`;
  
  if (mode === ReasoningMode.REWRITE) {
    userPrompt += "Goal: Rewrite with minimum necessary structural edits to improve clarity and logic while preserving voice.";
  } else if (mode === ReasoningMode.TEACH) {
    userPrompt += "Goal: Identify reasoning patterns as observations, not judgments.";
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        { role: "user", parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2, // Low temperature for analytical precision
      }
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(textResponse) as AnalysisResponse;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};