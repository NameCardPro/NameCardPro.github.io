
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function extractContactInfo(imageBase64: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64,
            },
          },
          {
            text: "Extract all contact information from this business card. Return it as a JSON object matching the requested schema.",
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          company: { type: Type.STRING },
          department: { type: Type.STRING },
          title: { type: Type.STRING },
          mobile: { type: Type.STRING },
          workPhone: { type: Type.STRING },
          email: { type: Type.STRING },
          // Fix: Added postcode to schema to ensure extraction of this required field
          postcode: { type: Type.STRING },
          address: { type: Type.STRING },
          website: { type: Type.STRING },
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return null;
  }
}
