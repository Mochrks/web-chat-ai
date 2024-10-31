
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import TypewriterEffect from '@/components/demo/TypewriterEffect'
import { MessageFormatter } from './MessageFormatter';
interface Message {
    id: string
    content: string
    isUser: boolean
    isTyping?: boolean
}

interface MessageListProps {
    messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
    return (
        <div className="space-y-6">
            {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Avatar className="w-8 h-8 text-black">
                            <AvatarImage src={message.isUser ? "/user-avatar.png" : "/ai-avatar.png"} />
                            <AvatarFallback>{message.isUser ? "U" : "AI"}</AvatarFallback>
                        </Avatar>
                        <div
                            className={`mx-2 p-3 rounded-3xl ${message.isUser
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                                }`}
                        >
                            {message.isUser ? (
                                message.content
                            ) : message.isTyping ? (
                                <TypewriterEffect text={message.content} />
                            ) : (
                                <MessageFormatter content={message.content} />
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}