import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useSession } from "next-auth/react";
import MessageList from "@/components/demo/MessageList";
import { useChat } from "@/hooks/useChat";
import { useLanguage } from "@/hooks/useLanguage";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useGreeting } from "@/hooks/useGreeting";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { AudioSpectrum } from "@/components/ui/AudioSpectrum";
import PromptBar from "@/components/demo/PromptBar";
import type { PromptBarModel } from "@/components/demo/PromptBar";
import { SUGGESTIONS } from "@/data/suggestions";
import {
  APP_GITHUB,
  APP_DEVELOPER,
  SCROLL_OFFSET_TOP,
  SCROLL_OFFSET_BOTTOM,
} from "@/constants/app";
import { MODELS, DEFAULT_MODEL } from "@/constants/models";
import { ROLES } from "@/constants/roles";

export default function ChatArea() {
  const { data: session } = useSession();
  const {
    messages,
    sendMessage,
    stopGeneration,
    regenerateResponse,
    loading,
    selectedModel,
    setSelectedModel,
    selectedRole,
    setSelectedRole,
  } = useChat();
  const { t } = useLanguage();

  const promptBarModels: PromptBarModel[] = MODELS.map((m) => ({
    key: m,
    name: m,
    tag: m === DEFAULT_MODEL ? "Default" : undefined,
  }));

  const messagesStartRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileRef = useRef<File | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [selectedEffort, setSelectedEffort] = useState("Medium");

  const {
    isListening,
    listeningText,
    startListening,
    stopListening,
    finalTranscript,
    clearTranscript,
  } = useVoiceInput();

  const greetingsRaw = t("chat.greetings");
  const greetings = Array.isArray(greetingsRaw) ? greetingsRaw : ["Hello"];
  const currentGreeting = useGreeting(greetings);

  // Voice → inject into PromptBar via a shared ref approach: we surface
  // voice as `onDictate` so PromptBar handles it natively.
  useEffect(() => {
    if (finalTranscript) clearTranscript();
  }, [finalTranscript, clearTranscript]);

  const handleScroll = (e: any) => {
    setShowScrollTop(e.scroll > SCROLL_OFFSET_TOP);
    setShowScrollBottom(e.limit > 0 && e.scroll < e.limit - SCROLL_OFFSET_BOTTOM);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
  };

  const scrollToTop = () => {
    messagesStartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (messages.length === 0) {
      gsap.fromTo(
        ".suggestion-card",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.3 }
      );
      gsap.fromTo(
        ".chat-input-container",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.6 }
      );
    }
  }, [messages.length]);

  // Dictate handler — bridges PromptBar's onDictate to useVoiceInput
  const handleDictate = (): Promise<string> => {
    return new Promise((resolve) => {
      startListening();
      // Poll for finalTranscript via a short interval
      const poll = setInterval(() => {
        if (!isListening) {
          clearInterval(poll);
          resolve(finalTranscript ?? "");
          clearTranscript();
        }
      }, 200);
    });
  };

  // Attach handler — opens file picker
  const handleAttach = (sourceKey?: string): Promise<string> => {
    // File attach only — role switching is handled by onRoleChange
    return new Promise((resolve) => {
      if (!fileInputRef.current) return resolve("");
      fileInputRef.current.value = "";
      fileInputRef.current.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          pendingFileRef.current = file;
          resolve(file.name);
        } else {
          resolve("");
        }
      };
      fileInputRef.current.click();
    });
  };

  // ── Shared PromptBar props ────────────────────────────────────────────────
  const promptBarProps = {
    background: "var(--pied-surface)",
    color: "var(--pied-text)",
    menuBackground: "var(--pied-surface-2)",
    sparkColor: "var(--pied-accent)",
    radius: 14,
    width: "100%",
    maxRows: 5,
    busy: loading,
    models: promptBarModels,
    defaultModel: selectedModel,
    onModelChange: (modelKey: string) => setSelectedModel(modelKey),
    roles: ROLES,
    defaultRole: selectedRole,
    onRoleChange: (role: string) => setSelectedRole(role),
    efforts: ["Low", "Medium", "High", "Max"],
    defaultEffort: selectedEffort,
    onEffortChange: (effort: string) => setSelectedEffort(effort),
    onFileUpload: () => fileInputRef.current?.click(),
    onDictate: handleDictate,
    onAttach: handleAttach,
    onStop: stopGeneration,
  };

  return (
    <div className="relative flex h-full w-full flex-col justify-center">
      {/* Hidden file input for attach */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json"
        className="hidden"
        aria-hidden="true"
      />
      {/* Voice overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-pied-bg/95 p-8"
          >
            <div className="relative mb-8 mt-4 flex items-center justify-center">
              <div className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
                <AudioSpectrum isListening={isListening} />
              </div>
              <div className="relative z-10 flex size-28 items-center justify-center rounded-full bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                <span className="material-symbols-outlined text-4xl text-white">mic</span>
              </div>
            </div>
            <h3 className="mb-3 mt-4 text-xl font-semibold text-pied-text">
              {t("chat.voiceListening")}
            </h3>
            <p className="min-h-[3rem] max-w-lg text-center text-base font-medium text-pied-muted">
              {listeningText || t("chat.voiceStartDataPlaceholder")}
            </p>
            <button
              onClick={stopListening}
              className="mt-10 rounded-pied-button border border-pied-border bg-pied-surface px-8 py-2.5 text-sm font-medium text-pied-text transition-colors hover:border-white/[0.14] hover:bg-pied-surface-2"
            >
              {t("chat.voiceStop")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {messages.length === 0 ? (
        /* ── Empty / landing state ── */
        <div className="pied-ambient flex flex-1 flex-col items-center justify-center p-4">
          <div className="relative z-10 flex min-h-[80px] items-center justify-center py-4">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentGreeting}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-center text-[30px] font-semibold leading-[1.1] tracking-tight text-pied-text sm:text-[38px] md:text-[46px] lg:text-[52px]"
              >
                {currentGreeting}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Suggestion chips */}
          <div className="relative z-10 mb-8 flex max-w-xl flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => sendMessage(s.label)}
                className="suggestion-card flex items-center gap-2 rounded-pied border border-pied-border bg-transparent px-3.5 py-2 text-[13px] text-pied-muted opacity-0 transition-colors hover:border-white/[0.14] hover:text-pied-text"
              >
                <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* PromptBar — initial state */}
          <div className="chat-input-container relative z-10 w-full max-w-[860px] opacity-0">
            <PromptBar
              {...promptBarProps}
              placeholder={t("chat.initialPlaceholder")}
              onSend={(text, detail) => {
                if (detail.model) setSelectedModel(detail.model.key);
                if (detail.role) setSelectedRole(detail.role);
                if (detail.effort) setSelectedEffort(detail.effort);
                const file = pendingFileRef.current ?? undefined;
                pendingFileRef.current = null;
                let fullText = text.trim();
                if (detail.codeContext) {
                  fullText =
                    (fullText ? fullText + "\n\n" : "") + "```\n" + detail.codeContext + "\n```";
                }
                if (detail.rules) {
                  fullText =
                    (fullText ? fullText + "\n\n" : "") +
                    "[Rules & Instructions:\n" +
                    detail.rules +
                    "]";
                }
                if (fullText.trim() || file) sendMessage(fullText.trim(), file);
              }}
            />
          </div>

          <div className="absolute bottom-5 text-center">
            <p className="text-[10px] text-pied-muted/50">
              &copy; {new Date().getFullYear()} {t("chat.created")}{" "}
              <a
                href={APP_GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pied-muted/60 underline decoration-pied-border underline-offset-2 transition-colors hover:text-pied-text"
              >
                {APP_DEVELOPER}
              </a>
            </p>
          </div>
        </div>
      ) : (
        /* ── Active chat state ── */
        <div className="relative flex h-full w-full flex-col overflow-hidden">
          <SmoothScroll className="flex-1" onScroll={handleScroll}>
            <div className="mx-auto flex min-h-full w-full max-w-[820px] flex-col">
              <div className="flex-1 px-4 py-6">
                <div ref={messagesStartRef} />
                <MessageList
                  messages={messages}
                  userImage={session?.user?.image}
                  onSendMessage={(content) => sendMessage(content)}
                  onRegenerate={regenerateResponse}
                  isLoading={loading}
                />
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </div>
          </SmoothScroll>

          {/* Scroll buttons */}
          {messages.length > 0 && (
            <div className="absolute bottom-[110px] right-4 z-20 flex flex-col gap-2 md:bottom-[130px] md:right-8">
              <AnimatePresence>
                {showScrollTop && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToTop}
                    className="flex size-8 items-center justify-center rounded-full border border-pied-border bg-pied-surface text-pied-muted shadow-lg transition-all hover:border-white/[0.14] hover:bg-pied-surface-2 hover:text-pied-text md:size-9"
                    aria-label="Scroll to top"
                  >
                    <span className="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
                  </motion.button>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {showScrollBottom && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToBottom}
                    className="flex size-8 items-center justify-center rounded-full border border-pied-border bg-pied-surface text-pied-muted shadow-lg transition-all hover:border-white/[0.14] hover:bg-pied-surface-2 hover:text-pied-text md:size-9"
                    aria-label="Scroll to bottom"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      keyboard_arrow_down
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ── PromptBar — active state ── */}
          <div className="z-10 w-full shrink-0 bg-pied-bg pb-5 pt-2">
            <div className="mx-auto max-w-[860px] px-4">
              <PromptBar
                {...promptBarProps}
                placeholder={t("chat.inputPlaceholder")}
                onSend={(text, detail) => {
                  if (detail.model) setSelectedModel(detail.model.key);
                  if (detail.role) setSelectedRole(detail.role);
                  if (detail.effort) setSelectedEffort(detail.effort);
                  const file = pendingFileRef.current ?? undefined;
                  pendingFileRef.current = null;
                  let fullText = text.trim();
                  if (detail.codeContext) {
                    fullText =
                      (fullText ? fullText + "\n\n" : "") + "```\n" + detail.codeContext + "\n```";
                  }
                  if (detail.rules) {
                    fullText =
                      (fullText ? fullText + "\n\n" : "") +
                      "[Rules & Instructions:\n" +
                      detail.rules +
                      "]";
                  }
                  if (fullText.trim() || file) sendMessage(fullText.trim(), file);
                }}
              />
              <p className="mt-3 text-center text-[10px] font-normal text-pied-muted/50">
                {t("chat.modelWarning")}
              </p>
              <div className="mt-1 text-center">
                <p className="text-[10px] text-pied-muted/50">
                  &copy; {new Date().getFullYear()} {t("chat.created")}{" "}
                  <a
                    href={APP_GITHUB}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pied-muted/60 underline decoration-pied-border underline-offset-2 transition-colors hover:text-pied-text"
                  >
                    {APP_DEVELOPER}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
