export interface Suggestion {
    icon: string;
    label: string;
}

export const SUGGESTIONS: Suggestion[] = [
    { icon: "code", label: "Analyze my code" },
    { icon: "lightbulb", label: "Explain a concept" },
    { icon: "description", label: "Write documentation" },
    { icon: "architecture", label: "Review architecture" },
];
