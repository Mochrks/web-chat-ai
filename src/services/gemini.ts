import { GoogleGenAI } from "@google/genai";
import type { GeminiHistoryItem, ImagePart } from "@/types/chat";
import { buildModelId } from "@/utils/text";
import { THINKING_MESSAGE_DELAY } from "@/constants/app";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

let client: GoogleGenAI | null = null;
if (API_KEY) {
    client = new GoogleGenAI({ apiKey: API_KEY });
}

export async function sendMessageToGemini(
    history: GeminiHistoryItem[],
    message: string,
    imagePart?: ImagePart,
    modelName: string = "gemini-2.5-flash"
): Promise<string> {
    if (!API_KEY || !client) {
        console.warn("No Gemini API Key found. Using Mock Mode.");
        await new Promise((resolve) => setTimeout(resolve, THINKING_MESSAGE_DELAY));
        return (
            "Sorry, I'm having trouble connecting to the AI right now. Please try again later." +
            message
        );
    }

    try {
        const currentMessageParts: any[] = [{ text: message }];
        if (imagePart) {
            currentMessageParts.push(imagePart);
        }

        const contents = [
            ...history.map((msg) => ({
                role: msg.role,
                parts: msg.parts,
            })),
            {
                role: "user",
                parts: currentMessageParts,
            },
        ];

        const modelId = buildModelId(modelName);

        const response = await client.models.generateContent({
            model: modelId,
            contents,
            config: {},
        });

        return response.text || "";
    } catch (error) {
        console.error("Error sending message to Gemini:", error);
        throw error;
    }
}
