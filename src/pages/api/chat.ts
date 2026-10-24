import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";
import { buildModelId } from "@/utils/text";

type ChatResponseBody = {
  text?: string;
  error?: string;
  modelUsed?: string;
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

/**
 * Extracts a clean, user-friendly error message from a Google Gemini API error.
 * Strips raw JSON and internal details, returning only the human-readable message.
 */
function parseGeminiError(error: any): { message: string; status: number } {
  const raw: string = error?.message || "";

  // Try to extract JSON payload embedded in the error message
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const code: number = parsed?.error?.code || parsed?.code || 500;
      const msg: string = parsed?.error?.message || parsed?.message || "";

      // Rate limit / quota exceeded
      if (
        code === 429 ||
        msg.toLowerCase().includes("quota") ||
        msg.toLowerCase().includes("rate")
      ) {
        return {
          message: "Batas kuota API Gemini telah tercapai. Silakan coba beberapa saat lagi.",
          status: 429,
        };
      }

      // Auth / API key issues
      if (code === 401 || code === 403) {
        return {
          message:
            "API key tidak valid atau tidak memiliki akses. Periksa konfigurasi GEMINI_API_KEY.",
          status: 403,
        };
      }

      // Model not found
      if (code === 404) {
        return {
          message: "Model AI yang dipilih tidak tersedia. Coba pilih model lain.",
          status: 404,
        };
      }

      // Server overloaded
      if (
        code === 503 ||
        msg.toLowerCase().includes("overload") ||
        msg.toLowerCase().includes("unavailable")
      ) {
        return {
          message: "Server Gemini sedang sibuk. Silakan coba beberapa saat lagi.",
          status: 503,
        };
      }

      // Return clean message if available
      if (msg) {
        // Trim message to first sentence to avoid exposing internals
        const firstSentence = msg.split(/\.\s/)[0].replace(/\s+/g, " ").trim();
        return { message: firstSentence || msg, status: code };
      }
    } catch {
      // JSON parse failed, fall through
    }
  }

  // Plain-text rate limit hints
  if (
    raw.toLowerCase().includes("quota") ||
    raw.toLowerCase().includes("rate limit") ||
    raw.toLowerCase().includes("resource_exhausted")
  ) {
    return {
      message: "Batas kuota API Gemini telah tercapai. Silakan coba beberapa saat lagi.",
      status: 429,
    };
  }

  // Generic fallback
  return {
    message: "Terjadi kesalahan saat memproses permintaan AI ke Google Gemini. Silakan coba lagi.",
    status: 500,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ChatResponseBody>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Route Error: GEMINI_API_KEY is not defined in server environment");
    return res.status(500).json({
      error:
        "GEMINI_API_KEY belum dikonfigurasi di file .env.local. Pastikan Anda menambahkan GEMINI_API_KEY di file .env.local.",
    });
  }

  try {
    const { history = [], message = "", imagePart, modelName = "Gemini 2.5 Flash" } = req.body;

    if (!message && !imagePart) {
      return res.status(400).json({ error: "Pesan atau file tidak boleh kosong." });
    }

    const ai = new GoogleGenAI({ apiKey });
    const targetModelId = buildModelId(modelName);

    const currentMessageParts: any[] = [{ text: message }];
    if (imagePart) {
      currentMessageParts.push(imagePart);
    }

    const contents = [
      ...history.map((msg: any) => ({
        role: msg.role === "model" ? "model" : "user",
        parts: msg.parts || [{ text: msg.content || "" }],
      })),
      {
        role: "user",
        parts: currentMessageParts,
      },
    ];

    let responseText = "";
    let activeModel = targetModelId;

    try {
      const response = await ai.models.generateContent({
        model: targetModelId,
        contents,
      });
      responseText = response.text || "";
    } catch (primaryErr: any) {
      console.warn(`Primary model ${targetModelId} error:`, primaryErr?.message || primaryErr);

      // If specific model fails (e.g. 404 or unsupported in region), fallback to stable gemini-2.5-flash
      if (targetModelId !== "gemini-2.5-flash") {
        console.info("Falling back to gemini-2.5-flash...");
        activeModel = "gemini-2.5-flash";
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
        });
        responseText = fallbackResponse.text || "";
      } else {
        throw primaryErr;
      }
    }

    return res.status(200).json({
      text: responseText,
      modelUsed: activeModel,
    });
  } catch (error: any) {
    console.error("Error in /api/chat handler:", error);
    const { message, status } = parseGeminiError(error);
    return res.status(status).json({ error: message });
  }
}
