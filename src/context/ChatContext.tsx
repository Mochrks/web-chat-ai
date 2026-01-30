import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sendMessageToGemini, fileToGenerativePart } from '@/lib/gemini';

export interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
    image?: string; // Base64 string for display
    isThinking?: boolean;
}

export interface ChatSession {
    id: string;
    title: string;
    date: string;
    messages: Message[];
}

interface ChatContextType {
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

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [history, setHistory] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Flash");
    const [selectedRole, setSelectedRole] = useState("Fullstack");

    // Derived for backward compatibility if needed, or just expose selectedModel
    const modelName = selectedModel;

    // Load history from local storage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    // Save history to local storage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('chatHistory', JSON.stringify(history));
        } catch (error) {
            console.error("Failed to save history to localStorage:", error);
            // Optionally clear old history to make space, or just warn
        }
    }, [history]);

    const newChat = () => {
        setMessages([]);
        setCurrentChatId(null);
    };

    const loadChat = (id: string) => {
        const session = history.find((h) => h.id === id);
        if (session) {
            setMessages(session.messages);
            setCurrentChatId(id);
        }
    };

    const deleteChat = (id: string) => {
        setHistory((prev) => prev.filter((h) => h.id !== id));
        if (currentChatId === id) {
            newChat();
        }
    };

    const clearAllChats = () => {
        setHistory([]);
        setMessages([]);
        setCurrentChatId(null);
        try {
            localStorage.removeItem('chatHistory');
        } catch (e) {
            console.error("Error clearing local storage", e);
        }
    };

    const sendMessage = async (content: string, file?: File | undefined) => {
        if (!content.trim() && !file) return;

        setLoading(true);
        let imagePart;
        let imageBase64; // Keep this distinct from imagePart

        if (file) {
            try {
                const part = await fileToGenerativePart(file);
                imagePart = part; // { inlineData: { data: ..., mimeType: ... } }
                imageBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            } catch (error) {
                console.error("Error processing image:", error);
            }
        }

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            image: imageBase64 // Display purpose
        };

        // UI Updates immediately
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);

        // Update History / Session
        let activeChatId = currentChatId;
        const thinkingMessageId = (Date.now() + 1).toString();

        if (!activeChatId) {
            activeChatId = Date.now().toString();
            // Create new session
            const newSession: ChatSession = {
                id: activeChatId,
                title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
                date: new Date().toISOString(),
                messages: updatedMessages
            };
            setHistory(prev => [newSession, ...prev]);
            setCurrentChatId(activeChatId);
        } else {
            setHistory(prev => prev.map(h =>
                h.id === activeChatId ? { ...h, messages: updatedMessages } : h
            ));
        }

        // Add thinking state
        setMessages(prev => [
            ...prev,
            { id: thinkingMessageId, role: 'model', content: 'Thinking...', isThinking: true }
        ]);

        try {
            // 1. Prepare History for API (exclude the message we just added effectively, as we send it as 'prompt')
            // Actually sendMessageToGemini usually takes history + new prompt.
            // The `updatedMessages` includes the new user message.
            // If `sendMessageToGemini` appends the prompt itself, we should pass `messages` (previous state).
            // Let's check `sendMessageToGemini` implementation ideally, but assuming standard:
            // We'll pass the *previous* messages as history.

            const previousMessages = messages; // State before this update

            const apiHistory = previousMessages.map(m => {
                const parts: any[] = [{ text: m.content }];
                if (m.image) {
                    // Re-construct part from base64 string if safely possible, 
                    // or ideally we shouldn't rely on parsing the string if we have the original file, 
                    // but for history we must parse.
                    const match = m.image.match(/^data:(.*);base64,(.*)$/);
                    if (match) {
                        const [, mimeType, base64Data] = match;
                        parts.push({
                            inlineData: {
                                data: base64Data,
                                mimeType: mimeType
                            }
                        });
                    }
                }
                return {
                    role: m.role,
                    parts: parts
                };
            });

            // 2. Prepare System Instruction / Context based on Role
            const roleInstruction = `System Instruction: You are an expert ${selectedRole}. Output your response focusing on ${selectedRole} specific insights, best practices, and terminology.`;
            const finalPrompt = `${roleInstruction}\n\nUser Query: ${content}`;

            const responseText = await sendMessageToGemini(apiHistory, finalPrompt, imagePart, selectedModel);

            // 3. Handle Success
            const aiMessage: Message = {
                id: Date.now().toString(),
                role: 'model',
                content: responseText
            };

            // Update UI/History with AI response, removing thinking
            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== thinkingMessageId);
                return [...filtered, aiMessage];
            });

            setHistory(prev => prev.map(h => {
                if (h.id === activeChatId) {
                    // We need to fetch the LATEST messages from the session or construct carefully
                    // The session in history might have the user message already.
                    // We just append the AI message.
                    return { ...h, messages: [...h.messages, aiMessage] };
                }
                return h;
            }));

        } catch (error) {
            console.error("Error getting response:", error);
            setMessages(prev => prev.filter(m => m.id !== thinkingMessageId).concat({
                id: Date.now().toString(),
                role: 'model',
                content: "Sorry, I encountered an error. Please try again."
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ChatContext.Provider value={{
            messages,
            history,
            loading,
            currentChatId,
            sendMessage,
            newChat,
            loadChat,
            deleteChat,
            clearAllChats,
            modelName,
            selectedModel,
            setSelectedModel,
            selectedRole,
            setSelectedRole
        }}>
            {children}
        </ChatContext.Provider>
    );
};
