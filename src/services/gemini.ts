import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Recipe {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  prepTime: string;
  calories: number;
  ingredients: { name: string; amount: string; isMissing?: boolean }[];
  steps: string[];
  dietaryTags: string[];
}

export async function analyzeFridge(base64Image: string): Promise<string[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Image.split(",")[1] || base64Image,
              mimeType: "image/jpeg",
            },
          },
          {
            text: "Identify all visible food ingredients in this fridge. Return only a comma-separated list of ingredient names.",
          },
        ],
      },
    ],
  });

  const text = response.text || "";
  return text.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function generateRecipes(
  ingredients: string[],
  dietaryRestrictions: string[]
): Promise<Recipe[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Based on these ingredients: ${ingredients.join(
      ", "
    )}, suggest 4 creative recipes. 
    Dietary restrictions: ${dietaryRestrictions.join(", ")}.
    For each recipe, identify if any essential ingredient is missing from the provided list.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
            prepTime: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  isMissing: { type: Type.BOOLEAN },
                },
                required: ["name", "amount"],
              },
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            dietaryTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "id",
            "title",
            "description",
            "difficulty",
            "prepTime",
            "calories",
            "ingredients",
            "steps",
            "dietaryTags",
          ],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse recipes", e);
    return [];
  }
}

export async function speakText(text: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/wav;base64,${base64Audio}`;
    }
  } catch (e) {
    console.error("TTS failed", e);
  }
  return null;
}
