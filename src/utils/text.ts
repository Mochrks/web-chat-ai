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

export function buildRolePrompt(role: string, userMessage: string): string {
    const instruction = `System Instruction: You are an expert ${role}. Output your response focusing on ${role} specific insights, best practices, and terminology.`;
    return `${instruction}\n\nUser Query: ${userMessage}`;
}

export function buildModelId(modelName: string): string {
    let modelId = modelName.toLowerCase().replace(/\s+/g, "-");
    if (modelId.includes("gemma") && !modelId.includes("-it")) {
        modelId += "-it";
    }
    return modelId;
}
