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
  const suggestionInstruction = `\n\nAt the very end of your response, provide exactly 3 concise follow-up suggestions/questions that the user might want to ask next. Format them strictly as:\n${SUGGESTIONS_DELIMITER}\n- [Follow-up question 1]\n- [Follow-up question 2]\n- [Follow-up question 3]`;

  if (isGeneral) {
    const instruction =
      "System Instruction: You are a versatile, friendly, and helpful AI assistant. Do not confine your response to any specific technical specialization or narrow focus. Respond conversationally, naturally, and adaptively based on the user's topic and intent." +
      suggestionInstruction;
    return `${instruction}\n\nUser Query: ${userMessage}`;
  }
  const instruction =
    `System Instruction: You are an expert ${role}. Output your response focusing on ${role} specific insights, best practices, and terminology.` +
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

  // Smart contextual fallback suggestions
  if (suggestions.length === 0 && content.length > 20) {
    const lower = (userQuery + " " + content).toLowerCase();
    if (
      lower.includes("code") ||
      lower.includes("function") ||
      lower.includes("komponen") ||
      lower.includes("api") ||
      lower.includes("error") ||
      lower.includes("bug")
    ) {
      suggestions = [
        "Bisa berikan contoh kode lengkapnya?",
        "Bagaimana cara testing dan error handling-nya?",
        "Apa alternatif atau best practice untuk ini?",
      ];
    } else if (
      lower.includes("bagaimana") ||
      lower.includes("cara") ||
      lower.includes("langkah") ||
      lower.includes("tutorial")
    ) {
      suggestions = [
        "Apa langkah praktis berikutnya?",
        "Apa saja tips dan hal yang perlu dihindari?",
        "Bisa berikan studi kasus nyatanya?",
      ];
    } else {
      suggestions = [
        "Bisa jelaskan lebih detail dengan contoh?",
        "Apa kelebihan dan kekurangannya?",
        "Bagaimana rekomendasi terbaiknya?",
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
  let modelId = modelName.toLowerCase().replace(/\s+/g, "-");
  if (modelId.includes("gemma") && !modelId.includes("-it")) {
    modelId += "-it";
  }
  return modelId;
}
