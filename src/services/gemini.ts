import type { GeminiHistoryItem, ImagePart } from "@/types/chat";

export async function sendMessageToGemini(
  history: GeminiHistoryItem[],
  message: string,
  imagePart?: ImagePart,
  modelName: string = "Gemini 2.5 Flash",
  signal?: AbortSignal
): Promise<string> {
  if (signal?.aborted) {
    const err = new Error("Request aborted");
    err.name = "AbortError";
    throw err;
  }

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        history,
        message,
        imagePart,
        modelName,
      }),
      signal,
    });

    if (!response.ok) {
      let errorMsg = "Gagal mendapatkan respon dari server AI.";
      try {
        const errorData = await response.json();
        if (errorData?.error) {
          errorMsg = errorData.error;
        }
      } catch {
        errorMsg = `Server error HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data.text || "";
  } catch (error: any) {
    if (error?.name === "AbortError" || signal?.aborted) {
      const err = new Error("Request aborted");
      err.name = "AbortError";
      throw err;
    }
    console.error("Error communicating with AI service:", error);
    throw error;
  }
}
