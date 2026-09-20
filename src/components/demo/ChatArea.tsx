import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { X } from "lucide-react";
import MessageList from "@/components/demo/MessageList";
import { useChat } from "@/hooks/useChat";
import { useLanguage } from "@/hooks/useLanguage";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useGreeting } from "@/hooks/useGreeting";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { AudioSpectrum } from "@/components/ui/AudioSpectrum";
import { SUGGESTIONS } from "@/data/suggestions";
import { APP_GITHUB, APP_DEVELOPER, SCROLL_OFFSET_TOP, SCROLL_OFFSET_BOTTOM, MAX_TEXTAREA_HEIGHT } from "@/constants/app";

export default function ChatArea() {
  const { data: session } = useSession();
  const { messages, sendMessage, loading } = useChat();
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [initialQuestion, setInitialQuestion] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialInputRef = useRef<HTMLTextAreaElement>(null);
  const mainInputRef = useRef<HTMLTextAreaElement>(null);

  const messagesStartRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const { isListening, listeningText, startListening, stopListening, finalTranscript, clearTranscript } =
    useVoiceInput();

  const greetingsRaw = t("chat.greetings");
  const greetings = Array.isArray(greetingsRaw) ? greetingsRaw : ["Hello"];
  const currentGreeting = useGreeting(greetings);

  useEffect(() => {
    if (finalTranscript) {
      if (messages.length === 0) {
        setInitialQuestion((prev) => (prev ? prev + " " : "") + finalTranscript);
      } else {
        setInput((prev) => (prev ? prev + " " : "") + finalTranscript);
      }
      clearTranscript();
    }
  }, [finalTranscript, messages.length, clearTranscript]);

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
    if (!initialQuestion && initialInputRef.current) {
      initialInputRef.current.style.height = "auto";
    }
  }, [initialQuestion]);

  useEffect(() => {
    if (!input && mainInputRef.current) {
      mainInputRef.current.style.height = "auto";
    }
  }, [input]);

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

  const handleInitialSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (initialQuestion.trim()) {
      sendMessage(initialQuestion);
      setInitialQuestion("");
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((input.trim() || selectedFile) && !loading) {
      await sendMessage(input, selectedFile || undefined);
      setInput("");
      clearFile();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col h-full w-full justify-center relative">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-pied-bg/95 p-8"
          >
            <div className="relative mb-8 mt-4 flex items-center justify-center">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
                <AudioSpectrum isListening={isListening} />
              </div>
              <div className="size-28 rounded-full bg-red-500 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                <span className="material-symbols-outlined text-white text-4xl">mic</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-pied-text mt-4 mb-3">{t("chat.voiceListening")}</h3>
            <p className="text-base text-pied-muted text-center max-w-lg font-medium min-h-[3rem]">
              {listeningText || t("chat.voiceStartDataPlaceholder")}
            </p>
            <button
              onClick={stopListening}
              className="mt-10 px-8 py-2.5 rounded-pied-button bg-pied-surface hover:bg-pied-surface-2 text-pied-text border border-pied-border hover:border-white/[0.14] transition-colors font-medium text-sm"
            >
              {t("chat.voiceStop")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 pied-ambient">
          <div className="py-4 min-h-[80px] flex items-center justify-center relative z-10">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentGreeting}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-[30px] sm:text-[38px] md:text-[46px] lg:text-[52px] font-semibold text-pied-text tracking-tight text-center leading-[1.1]"
              >
                {currentGreeting}
              </motion.h1>
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-xl relative z-10">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => setInitialQuestion(s.label)}
                className="suggestion-card flex items-center gap-2 px-3.5 py-2 bg-transparent border border-pied-border rounded-pied text-[13px] text-pied-muted hover:border-white/[0.14] hover:text-pied-text transition-colors opacity-0"
              >
                <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleInitialSearch}
            className="w-full max-w-xl relative z-10 chat-input-container opacity-0"
          >
            <div className="pied-input rounded-pied-button p-1.5 flex items-center">
              <textarea
                ref={initialInputRef}
                value={initialQuestion}
                onChange={(e) => {
                  setInitialQuestion(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleInitialSearch();
                  }
                }}
                rows={1}
                placeholder={t("chat.initialPlaceholder")}
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-pied-text placeholder:text-pied-muted/60 px-5 text-[15px] font-normal min-h-[44px] max-h-[200px] py-[11px] resize-none overflow-y-auto leading-relaxed"
              />
              <div className="flex items-center gap-1 pr-1">
                <button
                  type="button"
                  onClick={startListening}
                  className="size-9 rounded-full flex items-center justify-center text-pied-muted hover:text-pied-text hover:bg-white/[0.04] transition-colors"
                  title={t("chat.voiceInput")}
                  aria-label="Voice input"
                >
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="size-9 rounded-full bg-pied-accent flex items-center justify-center text-white hover:bg-pied-accent-hover transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                </button>
              </div>
            </div>
          </form>

          <div className="absolute bottom-5 text-center">
            <p className="text-[10px] text-pied-muted/50">
              &copy; {new Date().getFullYear()} {t("chat.created")}{" "}
              <a
                href={APP_GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pied-muted/60 hover:text-pied-text underline decoration-pied-border underline-offset-2 transition-colors"
              >
                {APP_DEVELOPER}
              </a>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full h-full overflow-hidden relative">
          <SmoothScroll className="flex-1" onScroll={handleScroll}>
            <div className="w-full max-w-[820px] mx-auto flex flex-col min-h-full">
              <div className="flex-1 px-4 py-6">
                <div ref={messagesStartRef} />
                <MessageList messages={messages} userImage={session?.user?.image} />
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </div>
          </SmoothScroll>

          {messages.length > 0 && (
            <div className="absolute right-4 bottom-[100px] md:right-8 md:bottom-[120px] z-20 flex flex-col gap-2">
              <AnimatePresence>
                {showScrollTop && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToTop}
                    className="size-8 md:size-9 rounded-full bg-pied-surface border border-pied-border flex items-center justify-center text-pied-muted hover:text-pied-text hover:bg-pied-surface-2 transition-all shadow-lg hover:border-white/[0.14]"
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
                    className="size-8 md:size-9 rounded-full bg-pied-surface border border-pied-border flex items-center justify-center text-pied-muted hover:text-pied-text hover:bg-pied-surface-2 transition-all shadow-lg hover:border-white/[0.14]"
                    aria-label="Scroll to bottom"
                  >
                    <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="w-full shrink-0 z-10 bg-pied-bg pt-2 pb-5">
            <div className="max-w-[820px] mx-auto px-4">
              <div className="relative">
                {previewUrl && (
                  <div className="absolute bottom-full mb-3 left-0 bg-pied-surface rounded-pied p-2 border border-pied-border">
                    <div className="relative inline-block">
                      <NextImage
                        src={previewUrl}
                        alt={t("chat.preview")}
                        width={72}
                        height={72}
                        className="rounded-pied-sm object-cover"
                      />
                      <button
                        onClick={clearFile}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="pied-input rounded-pied-button p-1.5 flex items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="size-9 rounded-full flex items-center justify-center text-pied-muted hover:text-pied-text hover:bg-white/[0.04] transition-colors shrink-0"
                    aria-label="Attach image"
                  >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  </button>
                  <textarea
                    ref={mainInputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(e.target.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={1}
                    className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-pied-text placeholder:text-pied-muted/60 px-3 text-[15px] font-normal min-h-[44px] max-h-[200px] py-[11px] resize-none overflow-y-auto leading-relaxed"
                    placeholder={t("chat.inputPlaceholder")}
                  />
                  <div className="flex items-center gap-1.5 pr-1">
                    <button
                      onClick={startListening}
                      className="size-9 rounded-full flex items-center justify-center text-pied-muted hover:text-pied-text hover:bg-white/[0.04] transition-colors"
                      title={t("chat.voiceInput")}
                      aria-label="Voice input"
                    >
                      <span className="material-symbols-outlined text-[20px]">mic</span>
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={(!input.trim() && !selectedFile) || loading}
                      className="size-9 rounded-full bg-pied-accent flex items-center justify-center text-white hover:bg-pied-accent-hover transition-colors active:scale-95 disabled:bg-pied-border disabled:text-pied-muted disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-center text-[10px] text-pied-muted/50 mt-3 font-normal">
                {t("chat.modelWarning")}
              </p>
              <div className="text-center mt-1">
                <p className="text-[10px] text-pied-muted/50">
                  &copy; {new Date().getFullYear()} {t("chat.created")}{" "}
                  <a
                    href={APP_GITHUB}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pied-muted/60 hover:text-pied-text underline decoration-pied-border underline-offset-2 transition-colors"
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
