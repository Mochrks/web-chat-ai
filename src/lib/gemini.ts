import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

let client: GoogleGenAI | null = null;
if (API_KEY) {
  client = new GoogleGenAI({ apiKey: API_KEY });
}

export async function sendMessageToGemini(
  history: { role: "user" | "model"; parts: { text: string; inlineData?: any }[] }[],
  message: string,
  imagePart?: { inlineData: { data: string; mimeType: string } },
  modelName: string = "gemini-2.5-flash"
) {
  if (!API_KEY || !client) {
    console.warn("No Gemini API Key found. Using Mock Mode.");
    await new Promise(resolve => setTimeout(resolve, 1500));
    return "Sorry, I'm having trouble connecting to the AI right now. Please try again later." + message;
  }

  try {
    const currentMessageParts: any[] = [{ text: message }];
    if (imagePart) {
      currentMessageParts.push(imagePart);
    }

    const contents = [
      ...history.map(msg => ({
        role: msg.role,
        parts: msg.parts
      })),
      {
        role: "user",
        parts: currentMessageParts
      }
    ];

    let modelId = modelName.toLowerCase().replace(/\s+/g, "-");
    
    if (modelId.includes('gemma') && !modelId.includes('-it')) {
       modelId += '-it';
    }


    const response = await client.models.generateContent({
        model: modelId, 
        contents: contents,
        config: {
        }
    });

    return response.text || "";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
}

export async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(",")[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
