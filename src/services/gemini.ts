import { GoogleGenAI } from "@google/genai";
import type { GeminiHistoryItem, ImagePart } from "@/types/chat";
import { buildModelId } from "@/utils/text";
import { THINKING_MESSAGE_DELAY } from "@/constants/app";

const API_KEY = process.env.GEMINI_API_KEY || "";

let client: GoogleGenAI | null = null;
if (API_KEY) {
  client = new GoogleGenAI({ apiKey: API_KEY });
}

export async function sendMessageToGemini(
  history: GeminiHistoryItem[],
  message: string,
  imagePart?: ImagePart,
  modelName: string = "gemini-2.5-flash",
  signal?: AbortSignal
): Promise<string> {
  if (signal?.aborted) {
    const err = new Error("Request aborted");
    err.name = "AbortError";
    throw err;
  }

  if (!API_KEY || !client) {
    console.warn("No Gemini API Key found. Using Mock Mode.");
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, THINKING_MESSAGE_DELAY);
      signal?.addEventListener("abort", () => {
        clearTimeout(timer);
        const err = new Error("Request aborted");
        err.name = "AbortError";
        reject(err);
      });
    });
    return "Terima kasih atas pertanyaannya! Ini adalah jawaban dari Pied AI untuk pesan Anda.\n\nSistem ini dirancang untuk memberikan jawaban cerdas, terstruktur, dan siap pakai. Silakan eksplorasi lebih lanjut melalui saran pertanyaan di bawah atau tanyakan topik lainnya!\n\n---SUGGESTIONS---\n- Bagaimana cara menghubungkan API Key Gemini?\n- Apa saja fitur unggulan di Pied AI ini?\n- Berikan contoh kode penerapan praktisnya";
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

    if (signal?.aborted) {
      const err = new Error("Request aborted");
      err.name = "AbortError";
      throw err;
    }

    const response = await client.models.generateContent({
      model: modelId,
      contents,
      config: {},
    });

    if (signal?.aborted) {
      const err = new Error("Request aborted");
      err.name = "AbortError";
      throw err;
    }

    return response.text || "";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
}
