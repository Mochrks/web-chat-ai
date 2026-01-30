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
    // Transform history to the format expected by the new SDK if needed
    // The new SDK often accepts flexible content. 
    // We'll construct the latest message content first.
    const currentMessageParts: any[] = [{ text: message }];
    if (imagePart) {
      currentMessageParts.push(imagePart);
    }

    // Combine history + current message for the call
    // Valid roles: 'user', 'model'
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

    // Normalize model name to ID (e.g. "Gemini 2.5 Flash" -> "gemini-2.5-flash")
    // Note: Assuming specific mapping or direct slugification works.
    let modelId = modelName.toLowerCase().replace(/\s+/g, "-");
    
    // Quick fix for Gemma models which usually need '-it' suffix for instruction tuned
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

// Keep the helper the same, just checking return types match what we need
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
