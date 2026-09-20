import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import NextImage from "next/image";
import type { Message } from "@/types/chat";
import type { MessageListProps } from "@/types/components";
import { extractReactNodeText } from "@/utils/text";
import { COPY_RESET_DELAY_MS } from "@/constants/app";

const CodeBlock = ({ children, ...props }: any) => {
    const [copied, setCopied] = useState(false);
    const codeText = extractReactNodeText(children);

    const onCopy = () => {
        navigator.clipboard.writeText(codeText);
        setCopied(true);
        setTimeout(() => setCopied(false), COPY_RESET_DELAY_MS);
    };

    return (
        <div className="relative group rounded-pied overflow-hidden my-4 border border-pied-border bg-[#0a0b10]">
            <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-pied-border">
                <div className="flex gap-1.5 opacity-40">
                    <div className="size-2 rounded-full bg-pied-muted/60" />
                    <div className="size-2 rounded-full bg-pied-muted/60" />
                    <div className="size-2 rounded-full bg-pied-muted/60" />
                </div>
                <button
                    onClick={onCopy}
                    className="text-[10px] uppercase font-semibold tracking-wider text-pied-muted hover:text-pied-text flex items-center gap-1.5 transition-colors"
                >
                    <span className="material-symbols-outlined text-[14px]">
                        {copied ? "check" : "content_copy"}
                    </span>
                    {copied ? "COPIED" : "COPY"}
                </button>
            </div>
            <div className="overflow-x-auto p-4">
                <pre {...props} className="!m-0 !bg-transparent text-sm font-mono leading-relaxed">
                    {children}
                </pre>
            </div>
        </div>
    );
};

const ThinkingIndicator = () => (
    <div className="flex items-center space-x-1.5 py-2">
        <div className="w-1.5 h-1.5 bg-pied-muted rounded-full pied-thinking-dot" />
        <div className="w-1.5 h-1.5 bg-pied-muted rounded-full pied-thinking-dot" />
        <div className="w-1.5 h-1.5 bg-pied-muted rounded-full pied-thinking-dot" />
        <span className="text-[11px] uppercase tracking-[0.1em] font-medium text-pied-muted ml-2">
            Thinking
        </span>
    </div>
);

const UserAvatar = ({ userImage }: { userImage?: string | null }) => (
    <div className="size-8 rounded-pied bg-pied-surface border border-pied-border overflow-hidden relative shrink-0 mt-0.5">
        {userImage ? (
            <NextImage src={userImage} alt="User" width={32} height={32} className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full bg-pied-surface-2 flex items-center justify-center text-pied-muted text-xs font-semibold">
                U
            </div>
        )}
    </div>
);

const AiAvatar = () => (
    <div className="size-8 rounded-pied bg-pied-surface border border-pied-border flex items-center justify-center shrink-0 mt-0.5">
        <span className="material-symbols-outlined text-pied-accent text-lg">auto_awesome</span>
    </div>
);

export default function MessageList({ messages, userImage }: MessageListProps) {
    return (
        <div className="space-y-1 pb-4">
            {messages.map((message: Message, index: number) => (
                <div key={message.id} className="py-5">
                    {index > 0 && <div className="border-t border-pied-border mb-5 -mt-5" />}

                    <div className="flex items-start gap-3">
                        {message.role !== "user" ? <AiAvatar /> : <UserAvatar userImage={userImage} />}

                        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                            <p className="text-pied-muted text-[10px] font-semibold uppercase tracking-[0.1em]">
                                {message.role === "user" ? "You" : "Pied AI"}
                            </p>

                            <div className="w-full">
                                {message.image && (
                                    <div className="mb-3 rounded-pied overflow-hidden border border-pied-border inline-block">
                                        <NextImage
                                            src={message.image}
                                            alt="User upload"
                                            width={400}
                                            height={240}
                                            className="max-w-full h-auto max-h-[280px] object-cover"
                                        />
                                    </div>
                                )}

                                {message.isThinking ? (
                                    <ThinkingIndicator />
                                ) : (
                                    <div
                                        className={`prose prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent max-w-none break-words ${message.role === "user"
                                                ? "text-pied-text break-all whitespace-pre-wrap"
                                                : "text-pied-text/90 message-content"
                                            }`}
                                    >
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeHighlight]}
                                            components={{
                                                pre: CodeBlock,
                                                table: ({ node, ...props }) => (
                                                    <div className="overflow-x-auto my-4 rounded-pied border border-pied-border">
                                                        <table {...props} className="w-full text-left text-sm" />
                                                    </div>
                                                ),
                                                thead: ({ node, ...props }) => (
                                                    <thead {...props} className="bg-white/[0.03] font-semibold" />
                                                ),
                                                th: ({ node, ...props }) => (
                                                    <th {...props} className="p-3 border-b border-pied-border font-semibold text-pied-text text-[13px]" />
                                                ),
                                                td: ({ node, ...props }) => (
                                                    <td {...props} className="p-3 border-b border-pied-border/50 text-pied-muted text-[13px]" />
                                                ),
                                                a: ({ node, ...props }) => (
                                                    <a
                                                        {...props}
                                                        className="text-pied-accent hover:text-pied-accent-hover hover:underline transition-colors font-medium"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    />
                                                ),
                                                code: ({ node, inline, className, children, ...props }: any) => {
                                                    const match = /language-(\w+)/.exec(className || "");
                                                    return !inline && match ? (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    ) : (
                                                        <code
                                                            className="bg-white/[0.06] text-pied-text rounded px-1.5 py-0.5 text-[13px] font-mono border border-white/[0.08]"
                                                            {...props}
                                                        >
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
