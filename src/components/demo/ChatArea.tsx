import React, { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Github, Send } from 'lucide-react'
import MessageList from '@/components/demo/MessageList'
import { Textarea } from '../ui/textarea'
import { TypewriterEffectSmooth } from "../ui/typewriter-effect";
import { TextGenerateEffect } from '../ui/text-generate-effect'
import Link from 'next/link'

interface Message {
    id: string
    content: string
    isUser: boolean
    isTyping?: boolean
}

export default function ChatArea() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [initialQuestion, setInitialQuestion] = useState('')
    const [loading, setLoading] = useState(false)

    const addMessage = (content: string, isUser: boolean, isTyping: boolean = false) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            content,
            isUser,
            isTyping,
        }
        setMessages((prevMessages) => [...prevMessages, newMessage])
        return newMessage.id
    }

    const handleSendMessage = async (message: string) => {
        setLoading(true)
        const userMessageId = addMessage(message, true)

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                        {
                            role: "user",
                            content: message,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 2000,
                }),
            })

            if (!response.ok) {
                throw new Error('OpenAI API request failed')
            }

            const data = await response.json()
            const aiResponse = data.choices[0].message.content

            // Add AI response with typing effect
            addMessage(aiResponse, false, true)

        } catch (error) {
            console.error('Error:', error)
            addMessage("Sorry, I encountered an error. Please try again.", false, true)
        } finally {
            setLoading(false)
        }
    }

    const handleInitialSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (initialQuestion.trim()) {
            handleSendMessage(initialQuestion)
            setInitialQuestion('')
        }
    }

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (input.trim()) {
            handleSendMessage(input)
            setInput('')
        }
    }

    const words = `What can I help you Sir?`;
    return (
        <div className="flex flex-col h-full w-[800px]">
            {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className='py-5'>
                        <TextGenerateEffect words={words} />
                    </div>
                    <form onSubmit={handleInitialSearch} className="w-full max-w-md">
                        <div className="flex items-center space-x-2">
                            <Input
                                value={initialQuestion}
                                onChange={(e) => setInitialQuestion(e.target.value)}
                                placeholder="Type your question here..."
                                className="flex-1 h-[50px] w-[60px] rounded-3xl"
                            />
                            <Button
                                type="submit"
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-9 h-9 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                            >
                                <Send className="h-4 w-4 mr-1" />
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto px-4 py-14">
                        <MessageList messages={messages} />
                        {loading && (
                            <div className="flex items-center justify-center mt-4">
                                <div className="relative">
                                    <div className="w-7 h-7 rounded-full border-4 border-gray-200" />
                                    <div className="absolute top-0 left-0 w-7 h-7 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                                </div>

                            </div>
                        )}
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleSend} className="flex items-end space-x-2">
                            <div className="relative flex-1">
                                <Textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="resize-none overflow-hidden h-[100px] max-h-[500px] pr-12 py-3 rounded-xl border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSend(e)
                                        }
                                    }}
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="absolute right-6 bottom-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                                    disabled={!input.trim() || loading}
                                >
                                    <Send className="h-4 w-4 mr-1" />
                                </Button>
                            </div>
                        </form>
                    </div>
                </>
            )}
            <footer className="w-full ">
                <div className="container mx-auto flex justify-center items-center py-4">
                    <p className="text-sm text-muted-foreground text-center">
                        © {new Date().getFullYear()} All rights reserved by <a href="https://github.com/Mochrks" className="hover:underline">@mochrks</a>
                    </p>
                </div>
            </footer>
        </div>
    )
}