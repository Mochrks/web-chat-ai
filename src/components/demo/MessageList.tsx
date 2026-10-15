import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import NextImage from "next/image";
import type { Message } from "@/types/chat";
import type { MessageListProps } from "@/types/components";
import { extractReactNodeText, stripMarkdown } from "@/utils/text";
import { COPY_RESET_DELAY_MS } from "@/constants/app";
import ThoughtLine from "@/components/demo/ThoughtLine";

const CodeBlock = ({ children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const codeText = extractReactNodeText(children);

  const onCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_RESET_DELAY_MS);
  };

  return (
    <div className="group relative my-4 overflow-hidden rounded-pied border border-pied-border bg-[#0a0b10]">
      <div className="flex items-center justify-between border-b border-pied-border bg-white/[0.02] px-4 py-2">
        <div className="flex gap-1.5 opacity-40">
          <div className="size-2 rounded-full bg-pied-muted/60" />
          <div className="size-2 rounded-full bg-pied-muted/60" />
          <div className="size-2 rounded-full bg-pied-muted/60" />
        </div>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-pied-muted transition-colors hover:text-pied-text"
        >
          <span className="material-symbols-outlined text-[14px]">
            {copied ? "check" : "content_copy"}
          </span>
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <pre {...props} className="!m-0 !bg-transparent font-mono text-sm leading-relaxed">
          {children}
        </pre>
      </div>
    </div>
  );
};

const ThinkingIndicator = () => (
  <div className="py-1">
    <ThoughtLine
      working={true}
      steps={["Reading the question", "Searching your notes", "Drafting an answer"]}
      label="Thinking…"
      doneLabel="Thought for"
      glyph="sparkle"
      fontSize={13}
      breathPeriod={1.6}
      breathDepth={1.45}
      settleDuration={350}
      settleBlur={2}
      collapsible={false}
      showTimer={true}
      color="var(--pied-muted)"
      glyphColor="var(--pied-accent)"
    />
  </div>
);

const UserAvatar = ({ userImage }: { userImage?: string | null }) => (
  <div className="relative mt-0.5 size-8 shrink-0 overflow-hidden rounded-pied border border-pied-border bg-pied-surface">
    {userImage ? (
      <NextImage
        src={userImage}
        alt="User"
        width={32}
        height={32}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-pied-surface-2 text-xs font-semibold text-pied-muted">
        U
      </div>
    )}
  </div>
);

const AiAvatar = () => (
  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-pied border border-pied-border bg-pied-surface">
    <span className="material-symbols-outlined text-lg text-pied-accent">auto_awesome</span>
  </div>
);

export default function MessageList({
  messages,
  userImage,
  onSendMessage,
  onRegenerate,
  isLoading,
}: MessageListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = stripMarkdown(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const isIndonesian = /yang|dan|ini|untuk|dengan|bisa|saya|adalah/i.test(cleanText);
    utterance.lang = isIndonesian ? "id-ID" : "en-US";
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Find index of the latest model message
  let lastModelIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role !== "user") {
      lastModelIndex = i;
      break;
    }
  }

  return (
    <div className="space-y-1 pb-4">
      {messages.map((message: Message, index: number) => {
        const isAi = message.role !== "user";
        const isLastModel = index === lastModelIndex;

        return (
          <div key={message.id} className="py-5">
            {index > 0 && <div className="-mt-5 mb-5 border-t border-pied-border" />}

            <div className="flex items-start gap-3">
              {isAi ? <AiAvatar /> : <UserAvatar userImage={userImage} />}

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-pied-muted">
                  {message.role === "user" ? "You" : "Pied AI"}
                </p>

                <div className="w-full">
                  {message.image && (
                    <div className="mb-3 inline-block overflow-hidden rounded-pied border border-pied-border">
                      <NextImage
                        src={message.image}
                        alt="User upload"
                        width={400}
                        height={240}
                        className="h-auto max-h-[280px] max-w-full object-cover"
                      />
                    </div>
                  )}

                  {message.isThinking ? (
                    <ThinkingIndicator />
                  ) : (
                    <>
                      <div
                        className={`prose prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent max-w-none break-words ${
                          message.role === "user"
                            ? "whitespace-pre-wrap break-all text-pied-text"
                            : "message-content text-pied-text/90"
                        }`}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            pre: CodeBlock,
                            table: ({ node, ...props }) => (
                              <div className="my-4 overflow-x-auto rounded-pied border border-pied-border">
                                <table {...props} className="w-full text-left text-sm" />
                              </div>
                            ),
                            thead: ({ node, ...props }) => (
                              <thead {...props} className="bg-white/[0.03] font-semibold" />
                            ),
                            th: ({ node, ...props }) => (
                              <th
                                {...props}
                                className="border-b border-pied-border p-3 text-[13px] font-semibold text-pied-text"
                              />
                            ),
                            td: ({ node, ...props }) => (
                              <td
                                {...props}
                                className="border-b border-pied-border/50 p-3 text-[13px] text-pied-muted"
                              />
                            ),
                            a: ({ node, ...props }) => (
                              <a
                                {...props}
                                className="font-medium text-pied-accent transition-colors hover:text-pied-accent-hover hover:underline"
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
                                  className="rounded border border-white/[0.08] bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-pied-text"
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

                      {/* AI Message Action Bar */}
                      {isAi && (
                        <div className="mt-3 flex items-center gap-1 text-pied-muted">
                          <button
                            type="button"
                            onClick={() => handleCopy(message.id, message.content)}
                            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-pied-muted transition-colors hover:bg-white/[0.04] hover:text-pied-text"
                            title="Copy response"
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              {copiedId === message.id ? "check" : "content_copy"}
                            </span>
                            <span className="text-[11px]">
                              {copiedId === message.id ? "Copied" : "Copy"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSpeak(message.id, message.content)}
                            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-white/[0.04] ${
                              speakingId === message.id
                                ? "text-pied-accent"
                                : "text-pied-muted hover:text-pied-text"
                            }`}
                            title={speakingId === message.id ? "Stop reading" : "Read aloud"}
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              {speakingId === message.id ? "volume_off" : "volume_up"}
                            </span>
                            <span className="text-[11px]">
                              {speakingId === message.id ? "Stop" : "Read"}
                            </span>
                          </button>

                          {isLastModel && onRegenerate && (
                            <button
                              type="button"
                              onClick={onRegenerate}
                              disabled={isLoading}
                              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-pied-muted transition-colors hover:bg-white/[0.04] hover:text-pied-text disabled:opacity-40"
                              title="Regenerate response"
                            >
                              <span className="material-symbols-outlined text-[15px]">refresh</span>
                              <span className="text-[11px]">Regenerate</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Step 1: Next Point Suggestions */}
                      {isLastModel &&
                        !isLoading &&
                        message.suggestions &&
                        message.suggestions.length > 0 && (
                          <div className="mt-4 border-t border-pied-border/40 pt-3">
                            <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium text-pied-muted">
                              <span className="material-symbols-outlined text-[15px] text-pied-accent">
                                auto_awesome
                              </span>
                              <span>Pertanyaan selanjutnya yang disarankan:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, sIdx) => (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => onSendMessage?.(suggestion)}
                                  className="group flex items-center gap-2 rounded-full border border-pied-border/80 bg-pied-surface/80 px-3.5 py-1.5 text-xs text-pied-text/90 transition-all duration-200 hover:border-pied-accent/50 hover:bg-pied-surface-2 hover:text-white"
                                >
                                  <span className="text-left">{suggestion}</span>
                                  <span className="material-symbols-outlined text-[13px] text-pied-muted transition-transform group-hover:translate-x-0.5 group-hover:text-pied-accent">
                                    arrow_forward
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
