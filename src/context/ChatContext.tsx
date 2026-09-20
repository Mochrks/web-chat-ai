import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { sendMessageToGemini } from "@/services/gemini";
import { fileToGenerativePart, buildImageDataUrl, parseBase64Image } from "@/utils/image";
import { buildRolePrompt } from "@/utils/text";
import { truncateText } from "@/utils/text";
import { STORAGE_KEYS, MAX_CHAT_TITLE_LENGTH } from "@/constants/app";
import { DEFAULT_MODEL } from "@/constants/models";
import { DEFAULT_ROLE } from "@/constants/roles";
import type { Message, ChatSession, ChatContextType } from "@/types/chat";

export type { Message, ChatSession };

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [history, setHistory] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
    const [selectedRole, setSelectedRole] = useState(DEFAULT_ROLE);

    const modelName = selectedModel;

    useEffect(() => {
        const savedHistory = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history));
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
            localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
        } catch (e) {
            console.error("Error clearing local storage", e);
        }
    };

    const sendMessage = async (content: string, file?: File) => {
        if (!content.trim() && !file) return;

        setLoading(true);
        let imagePart;
        let imageBase64;

        if (file) {
            try {
                const part = await fileToGenerativePart(file);
                imagePart = part;
                imageBase64 = buildImageDataUrl(part);
            } catch (error) {
                console.error("Error processing image:", error);
            }
        }

        const newMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content,
            image: imageBase64,
        };

        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);

        let activeChatId = currentChatId;
        const thinkingMessageId = (Date.now() + 1).toString();

        if (!activeChatId) {
            activeChatId = Date.now().toString();
            const newSession: ChatSession = {
                id: activeChatId,
                title: truncateText(content, MAX_CHAT_TITLE_LENGTH),
                date: new Date().toISOString(),
                messages: updatedMessages,
            };
            setHistory((prev) => [newSession, ...prev]);
            setCurrentChatId(activeChatId);
        } else {
            setHistory((prev) =>
                prev.map((h) =>
                    h.id === activeChatId ? { ...h, messages: updatedMessages } : h
                )
            );
        }

        setMessages((prev) => [
            ...prev,
            { id: thinkingMessageId, role: "model", content: "Thinking...", isThinking: true },
        ]);

        try {
            const previousMessages = messages;

            const apiHistory = previousMessages.map((m) => {
                const parts: any[] = [{ text: m.content }];
                if (m.image) {
                    const parsed = parseBase64Image(m.image);
                    if (parsed) {
                        parts.push({
                            inlineData: {
                                data: parsed.base64Data,
                                mimeType: parsed.mimeType,
                            },
                        });
                    }
                }
                return { role: m.role, parts };
            });

            const finalPrompt = buildRolePrompt(selectedRole, content);
            const responseText = await sendMessageToGemini(apiHistory, finalPrompt, imagePart, selectedModel);

            const aiMessage: Message = {
                id: Date.now().toString(),
                role: "model",
                content: responseText,
            };

            setMessages((prev) => {
                const filtered = prev.filter((m) => m.id !== thinkingMessageId);
                return [...filtered, aiMessage];
            });

            setHistory((prev) =>
                prev.map((h) => {
                    if (h.id === activeChatId) {
                        return { ...h, messages: [...h.messages, aiMessage] };
                    }
                    return h;
                })
            );
        } catch (error) {
            console.error("Error getting response:", error);
            setMessages((prev) =>
                prev
                    .filter((m) => m.id !== thinkingMessageId)
                    .concat({
                        id: Date.now().toString(),
                        role: "model",
                        content: "Sorry, I encountered an error. Please try again.",
                    })
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ChatContext.Provider
            value={{
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
                setSelectedRole,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
