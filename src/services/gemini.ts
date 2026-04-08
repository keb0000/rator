import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SongRecommendation {
  title: string;
  artist: string;
  reason: string;
  genre: string;
  mood: string;
}

export async function getSimilarSongs(songTitle: string, artistName: string): Promise<SongRecommendation[]> {
  const prompt = `I love the song "${songTitle}" by "${artistName}". Please find 5 similar songs that I might like. 
  For each song, provide the title, artist, a brief reason why it's similar (musical style, mood, instrumentation, etc.), the genre, and the mood.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              reason: { type: Type.STRING },
              genre: { type: Type.STRING },
              mood: { type: Type.STRING },
            },
            required: ["title", "artist", "reason", "genre", "mood"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching similar songs:", error);
    return [];
  }
}
