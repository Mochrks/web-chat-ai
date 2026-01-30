import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import NextImage from 'next/image';
import { Message } from '@/context/ChatContext';
import { MessageFormatter } from './MessageFormatter';

interface MessageListProps {
    messages: Message[];
    userImage?: string | null;
}

const Pre = ({ children, ...props }: any) => {
    const [copied, setCopied] = useState(false);

    // Extract text content safely
    const extractText = (node: any): string => {
        if (typeof node === 'string') return node;
        if (Array.isArray(node)) return node.map(extractText).join('');
        if (React.isValidElement(node) && node.props && (node.props as any).children) {
            return extractText((node.props as any).children);
        }
        return '';
    };

    const codeText = extractText(children);

    const onCopy = () => {
        navigator.clipboard.writeText(codeText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group rounded-xl overflow-hidden my-4 border border-white/10 bg-[#0d0d0d] shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5 backdrop-blur-sm">
                <div className="flex gap-1.5 opacity-60">
                    <div className="size-2.5 rounded-full bg-red-500/80"></div>
                    <div className="size-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="size-2.5 rounded-full bg-green-500/80"></div>
                </div>
                <button onClick={onCopy} className="text-[10px] uppercase font-bold tracking-wider text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
                    <span className="material-symbols-outlined text-[14px]">{copied ? 'check' : 'content_copy'}</span>
                    {copied ? 'COPIED' : 'COPY'}
                </button>
            </div>
            <div className="overflow-x-auto p-4 custom-scrollbar">
                <pre {...props} className="!m-0 !bg-transparent text-sm font-mono leading-relaxed">
                    {children}
                </pre>
            </div>
        </div>
    )
}

export default function MessageList({ messages, userImage }: MessageListProps) {
    return (
        <div className="space-y-8 pb-4 p-4 sm:p-8">
            {messages.map((message) => (
                <div key={message.id} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start max-w-4xl'}`}>

                    {/* AI Avatar (Left) */}
                    {message.role !== 'user' && (
                        <div className="size-9 rounded-xl glass-panel flex items-center justify-center shrink-0 border border-white/20 mt-1 shadow-lg shadow-purple-500/10">
                            <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                        </div>
                    )}

                    <div className={`flex flex-col gap-1.5 w-full ${message.role === 'user' ? 'items-end max-w-2xl' : 'items-start min-w-0'}`}>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider ml-1">
                            {message.role === 'user' ? 'You' : 'Pied AI'}
                        </p>

                        <div className={`
                            px-5 py-4 text-[15px] leading-relaxed shadow-2xl rounded-2xl w-full
                            ${message.role === 'user'
                                ? 'glass-bubble-user rounded-br-none text-white'
                                : 'glass-bubble-ai rounded-bl-none text-slate-100'
                            }
                        `}>
                            {message.image && (
                                <div className="mb-4 rounded-lg overflow-hidden border border-white/10 group cursor-pointer relative">
                                    <NextImage src={message.image} alt="User upload" width={500} height={300} className="max-w-full h-auto max-h-[300px] object-cover hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <span className="material-symbols-outlined text-white">zoom_in</span>
                                    </div>
                                </div>
                            )}

                            {message.isThinking ? (
                                <div className="flex items-center space-x-2 text-sm text-slate-400 animate-pulse h-6">
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    <span className="text-xs uppercase tracking-widest font-medium pl-2">Thinking</span>
                                </div>
                            ) : (
                                message.role === 'user' ? (
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                ) : (
                                    <div className="prose prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent max-w-none text-slate-100 space-y-4">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeHighlight]}
                                            components={{
                                                pre: Pre,
                                                table: ({ node, ...props }) => (
                                                    <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
                                                        <table {...props} className="w-full text-left text-sm" />
                                                    </div>
                                                ),
                                                thead: ({ node, ...props }) => <thead {...props} className="bg-white/5 font-bold" />,
                                                th: ({ node, ...props }) => <th {...props} className="p-3 border-b border-white/10 font-semibold text-slate-200" />,
                                                td: ({ node, ...props }) => <td {...props} className="p-3 border-b border-white/5 text-slate-400" />,
                                                a: ({ node, ...props }) => <a {...props} className="text-primary hover:underline hover:text-primary/80 transition-colors font-medium" target="_blank" rel="noopener noreferrer" />,
                                                code: ({ node, inline, className, children, ...props }: any) => {
                                                    const match = /language-(\w+)/.exec(className || '')
                                                    return !inline && match ? (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    ) : (
                                                        <code className="bg-white/10 text-white rounded px-1.5 py-0.5 text-[13px] font-mono border border-white/5" {...props}>
                                                            {children}
                                                        </code>
                                                    )
                                                }
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* User Avatar (Right) */}
                    {message.role === 'user' && (
                        <div className="size-9 rounded-xl bg-cover bg-center border border-primary/20 shadow-lg shadow-primary/10 overflow-hidden relative mt-1 shrink-0" >
                            {userImage ? (
                                <NextImage src={userImage} alt="User" width={36} height={36} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                    YO
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}