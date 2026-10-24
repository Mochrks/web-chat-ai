import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useSession } from "next-auth/react";
import MessageList from "@/components/demo/MessageList";
import { useChat } from "@/hooks/useChat";
import { useLanguage } from "@/hooks/useLanguage";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useGreeting } from "@/hooks/useGreeting";
import { SmoothScroll } from "@/components/demo/SmoothScroll";
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
import { MODELS, DEFAULT_MODEL, MODEL_CONFIGS } from "@/constants/models";
import { ROLES } from "@/constants/roles";
import { LlmIcon, ImageIcon, VideoIcon, AudioIcon } from "@/assets";

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

  const getModelCategoryIcon = (category: string) => {
    switch (category) {
      case "image":
        return <ImageIcon size={15} style={{ color: "#10B981" }} />;
      case "video":
        return <VideoIcon size={15} style={{ color: "#F59E0B" }} />;
      case "audio":
        return <AudioIcon size={15} style={{ color: "#EC4899" }} />;
      case "llm":
      default:
        return <LlmIcon size={15} style={{ color: "#818cf8" }} />;
    }
  };

  const promptBarModels: PromptBarModel[] = MODEL_CONFIGS.map((m) => ({
    key: m.name,
    name: m.name,
    tag: m.tag,
    category: m.category,
    categoryLabel: m.categoryLabel,
    description: m.description,
    icon: getModelCategoryIcon(m.category),
  }));

  const messagesStartRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileRef = useRef<File | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [selectedEffort, setSelectedEffort] = useState("Medium");
  const [isPromptRulesOpen, setIsPromptRulesOpen] = useState(false);

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
        ".head-prompt-pill",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out", delay: 0.2 }
      );
      gsap.fromTo(
        ".chat-input-container",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.4 }
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
    rulesOpen: isPromptRulesOpen,
    onRulesOpenChange: setIsPromptRulesOpen,
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
        <div className="pied-ambient relative flex flex-1 flex-col items-center justify-center p-4">
          {/* ── Smooth center dark blend for landing greeting and suggestions ── */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <div
              className="h-full w-full max-w-[1000px]"
              style={{
                background:
                  "radial-gradient(ellipse 75% 60% at 50% 50%, rgba(8, 9, 13, 0.65) 0%, rgba(8, 9, 13, 0.35) 50%, transparent 80%)",
              }}
            />
          </div>

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

          {/* PromptBar — initial state with Head Prompt */}
          <div className="chat-input-container relative z-10 w-full max-w-[860px] opacity-0">
            {/* ── Head Prompt bar (matching Image 3) ── */}
            <div className="head-prompt-bar no-scrollbar mb-3 flex w-full items-center justify-center gap-2 overflow-x-auto px-1 py-1">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => sendMessage(s.label)}
                  className={`head-prompt-pill group inline-flex shrink-0 items-center gap-2 rounded-full border border-pied-border/80 bg-pied-surface/70 px-3.5 py-1.5 text-xs font-medium text-pied-muted backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-pied-accent/40 hover:bg-pied-surface-2 hover:text-pied-text active:scale-[0.98] ${
                    idx >= 2 ? "hidden sm:inline-flex" : ""
                  }`}
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-white/[0.05] text-pied-muted transition-colors group-hover:bg-pied-accent/15 group-hover:text-pied-accent">
                    <span className="material-symbols-outlined text-[13px]">{s.icon}</span>
                  </span>
                  <span className="whitespace-nowrap">{s.label}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsPromptRulesOpen((v) => !v)}
                className="head-prompt-pill group hidden shrink-0 items-center gap-2 rounded-full border border-pied-border/80 bg-pied-surface/70 px-3.5 py-1.5 text-xs font-medium text-pied-muted backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-pied-accent/40 hover:bg-pied-surface-2 hover:text-pied-text active:scale-[0.98] sm:inline-flex"
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-white/[0.05] text-pied-muted transition-colors group-hover:bg-pied-accent/15 group-hover:text-pied-accent">
                  <span className="material-symbols-outlined text-[13px]">tune</span>
                </span>
                <span className="whitespace-nowrap">Rules</span>
              </button>
            </div>

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
          {/* ── Seamless full-width central reading backdrop with zero column edges ── */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 85% at 50% 50%, rgba(8, 9, 13, 0.72) 0%, rgba(8, 9, 13, 0.48) 55%, transparent 95%)",
            }}
            aria-hidden="true"
          />

          <SmoothScroll className="relative z-10 flex-1" onScroll={handleScroll}>
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
                {/* ── Bottom clearance spacer so messages scroll comfortably past the footer scrim ── */}
                <div className="h-24 sm:h-28" aria-hidden="true" />
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

          {/* ── PromptBar — active state with ultra-smooth multi-stop scrim blend ── */}
          <div className="relative z-10 w-full shrink-0">
            {/* Eased multi-stop gradient scrim floating above footer to smoothly dissolve scrolling messages */}
            <div
              className="pointer-events-none absolute -top-32 left-0 right-0 h-32"
              style={{
                background:
                  "linear-gradient(to top, #08090d 0%, #08090d 22%, rgba(8, 9, 13, 0.96) 42%, rgba(8, 9, 13, 0.82) 60%, rgba(8, 9, 13, 0.58) 75%, rgba(8, 9, 13, 0.32) 88%, rgba(8, 9, 13, 0.10) 96%, transparent 100%)",
              }}
              aria-hidden="true"
            />
            <div className="relative z-10 bg-pied-bg pb-5 pt-1">
              <div className="relative z-10 mx-auto max-w-[860px] px-4">
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
                        (fullText ? fullText + "\n\n" : "") +
                        "```\n" +
                        detail.codeContext +
                        "\n```";
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
        </div>
      )}
    </div>
  );
}
