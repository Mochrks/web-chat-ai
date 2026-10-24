import { MODEL_CONFIGS } from "@/constants/models";

export function extractReactNodeText(node: any): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractReactNodeText).join("");
  if (node?.props?.children) {
    return extractReactNodeText(node.props.children);
  }
  return "";
}

export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

export const SUGGESTIONS_DELIMITER = "---SUGGESTIONS---";

export function buildRolePrompt(role: string, userMessage: string): string {
  const isGeneral = !role || role.toLowerCase() === "umum" || role.toLowerCase() === "general";

  const languageInstruction = `
CRITICAL LANGUAGE RULES:
1. Always detect and reply in the EXACT same language used by the user in their prompt. If the user writes in Indonesian, reply in natural, fluent, and well-structured Indonesian. If the user writes in English, reply in English.
2. If the user explicitly commands or requests a specific language or translation (e.g. "jawab dalam bahasa...", "translate to...", "write in Spanish"), strictly obey the user's explicit instruction above all else.
3. Always match the tone and terminology appropriate for the target language.`;

  const suggestionInstruction = `
At the very end of your response, provide exactly 3 concise follow-up suggestions/questions that the user might want to ask next. Format them strictly as:
${SUGGESTIONS_DELIMITER}
- [Follow-up question 1]
- [Follow-up question 2]
- [Follow-up question 3]
IMPORTANT: The 3 follow-up suggestions MUST be written in the exact same language as your response (Indonesian suggestions for Indonesian response, English for English response).`;

  if (isGeneral) {
    const instruction =
      "System Instruction: You are Pied AI, a versatile, friendly, highly intelligent assistant developed to provide clear, structured, and helpful answers. Do not confine your response to any specific technical specialization unless asked. Respond conversationally, naturally, and adaptively based on the user's topic and intent." +
      languageInstruction +
      suggestionInstruction;
    return `${instruction}\n\nUser Query: ${userMessage}`;
  }

  const instruction =
    `System Instruction: You are Pied AI acting as an expert ${role}. Output your response focusing on ${role}-specific insights, best practices, and terminology.` +
    languageInstruction +
    suggestionInstruction;
  return `${instruction}\n\nUser Query: ${userMessage}`;
}

export function parseSuggestions(
  rawText: string,
  userQuery: string = ""
): { content: string; suggestions: string[] } {
  if (!rawText) return { content: "", suggestions: [] };

  let content = rawText;
  let suggestions: string[] = [];

  if (rawText.includes(SUGGESTIONS_DELIMITER)) {
    const parts = rawText.split(SUGGESTIONS_DELIMITER);
    content = parts[0].trim();
    const rawSuggestions = parts[1] || "";
    suggestions = rawSuggestions
      .split("\n")
      .map((s) =>
        s
          .replace(/^[-*•\d.]+\s*/, "")
          .replace(/[\[\]]/g, "")
          .trim()
      )
      .filter((s) => s.length > 3 && s.length < 120)
      .slice(0, 3);
  }

  // Smart contextual fallback suggestions matching language
  if (suggestions.length === 0 && content.length > 20) {
    const lower = (userQuery + " " + content).toLowerCase();
    const isIndonesian =
      /\b(apa|bagaimana|cara|kenapa|tolong|bisa|dan|yang|di|ke|ini|itu|buat|jelaskan|adalah)\b/i.test(
        lower
      );

    if (
      lower.includes("code") ||
      lower.includes("function") ||
      lower.includes("komponen") ||
      lower.includes("api") ||
      lower.includes("error") ||
      lower.includes("bug")
    ) {
      suggestions = isIndonesian
        ? [
            "Bisa berikan contoh kode lengkapnya?",
            "Bagaimana cara testing dan error handling-nya?",
            "Apa alternatif atau best practice untuk ini?",
          ]
        : [
            "Can you provide a full code example?",
            "How should we handle testing and error handling?",
            "What are the best practices or alternatives?",
          ];
    } else if (
      lower.includes("bagaimana") ||
      lower.includes("cara") ||
      lower.includes("langkah") ||
      lower.includes("tutorial") ||
      lower.includes("how to") ||
      lower.includes("steps")
    ) {
      suggestions = isIndonesian
        ? [
            "Apa langkah praktis berikutnya?",
            "Apa saja tips dan hal yang perlu dihindari?",
            "Bisa berikan studi kasus nyatanya?",
          ]
        : [
            "What is the next practical step?",
            "What tips and common pitfalls should I avoid?",
            "Can you provide a real-world case study?",
          ];
    } else {
      suggestions = isIndonesian
        ? [
            "Bisa jelaskan lebih detail dengan contoh?",
            "Apa kelebihan dan kekurangannya?",
            "Bagaimana rekomendasi terbaiknya?",
          ]
        : [
            "Can you explain further with an example?",
            "What are the pros and cons?",
            "What is the recommended approach?",
          ];
    }
  }

  return { content, suggestions };
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, "Code block omitted.")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/#+\s/g, "")
    .replace(/[*_~]{1,3}/g, "")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/^[-*•]\s+/gm, "")
    .trim();
}

export function buildModelId(modelName: string): string {
  const match = MODEL_CONFIGS.find(
    (m) =>
      m.name.toLowerCase() === modelName.toLowerCase() ||
      m.id.toLowerCase() === modelName.toLowerCase()
  );
  if (match) return match.id;

  let modelId = modelName.toLowerCase().replace(/\s+/g, "-");
  if (modelId.includes("gemma") && !modelId.includes("-it")) {
    modelId += "-it";
  }
  return modelId;
}
