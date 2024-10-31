import React, { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Search } from 'lucide-react'
import MessageList from '@/components/demo/MessageList'
import { Textarea } from '../ui/textarea'

interface Message {
    id: string
    content: string
    isUser: boolean
}

export default function ChatArea() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [initialQuestion, setInitialQuestion] = useState('')

    const addMessage = (content: string, isUser: boolean) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            content,
            isUser,
        }
        setMessages((prevMessages) => [...prevMessages, newMessage])
    }

    const handleSendMessage = (message: string) => {
        addMessage(message, true)
        // Simulate AI response (replace with actual API call in production)
        setTimeout(() => {
            addMessage("I'm an AI assistant. Here's a response to your query: " + message, false)
        }, 1000)
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

    return (
        <div className="flex flex-col h-full">
            {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <h1 className="text-2xl font-bold mb-4">What can I help you with?</h1>
                    <form onSubmit={handleInitialSearch} className="w-full max-w-md">
                        <div className="flex items-center space-x-2">
                            <Input
                                value={initialQuestion}
                                onChange={(e) => setInitialQuestion(e.target.value)}
                                placeholder="Type your question here..."
                                className="flex-1 h[300px] rounded-lg"
                            />
                            <Button
                                type="submit"
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-9 h-9 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto px-4 py-14">
                        <MessageList messages={messages} />
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleSend} className="flex items-end space-x-2">
                            <div className="relative flex-1">
                                <Textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="resize-none overflow-hidden min-h-[50px] max-h-[500px] pr-12 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
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
                                    className="absolute right-2 bottom-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                                    disabled={!input.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    )
}