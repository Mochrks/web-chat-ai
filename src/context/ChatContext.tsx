import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sendMessageToGemini, fileToGenerativePart } from '@/lib/gemini';

export interface Message {
    id: string;
    role: 'user' | 'model';
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

    const modelName = selectedModel;

    useEffect(() => {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('chatHistory', JSON.stringify(history));
        } catch (error) {
            console.error("Failed to save history to localStorage:", error);
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
        let imageBase64;

        if (file) {
            try {
                const part = await fileToGenerativePart(file);
                imagePart = part;
                imageBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            } catch (error) {
                console.error("Error processing image:", error);
            }
        }

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            image: imageBase64
        };

        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);

        let activeChatId = currentChatId;
        const thinkingMessageId = (Date.now() + 1).toString();

        if (!activeChatId) {
            activeChatId = Date.now().toString();
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

        setMessages(prev => [
            ...prev,
            { id: thinkingMessageId, role: 'model', content: 'Thinking...', isThinking: true }
        ]);

        try {

            const previousMessages = messages;

            const apiHistory = previousMessages.map(m => {
                const parts: any[] = [{ text: m.content }];
                if (m.image) {
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

            const roleInstruction = `System Instruction: You are an expert ${selectedRole}. Output your response focusing on ${selectedRole} specific insights, best practices, and terminology.`;
            const finalPrompt = `${roleInstruction}\n\nUser Query: ${content}`;

            const responseText = await sendMessageToGemini(apiHistory, finalPrompt, imagePart, selectedModel);

            const aiMessage: Message = {
                id: Date.now().toString(),
                role: 'model',
                content: responseText
            };

            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== thinkingMessageId);
                return [...filtered, aiMessage];
            });

            setHistory(prev => prev.map(h => {
                if (h.id === activeChatId) {
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
