export interface Message {
    id: string;
    role: "user" | "model";
    content: string;
    image?: string;
    isThinking?: boolean;
}

export interface ChatSession {
    id: string;
    title: string;
    date: string;
    messages: Message[];
}

export interface ChatContextType {
    messages: Message[];
    history: ChatSession[];
    loading: boolean;
    currentChatId: string | null;
    sendMessage: (content: string, file?: File) => Promise<void>;
    newChat: () => void;
    loadChat: (id: string) => void;
    deleteChat: (id: string) => void;
    clearAllChats: () => void;
    modelName: string;
    selectedModel: string;
    setSelectedModel: (model: string) => void;
    selectedRole: string;
    setSelectedRole: (role: string) => void;
}

export interface GeminiHistoryItem {
    role: "user" | "model";
    parts: { text: string; inlineData?: GeminiInlineData }[];
}

export interface GeminiInlineData {
    data: string;
    mimeType: string;
}

export interface ImagePart {
    inlineData: GeminiInlineData;
}
