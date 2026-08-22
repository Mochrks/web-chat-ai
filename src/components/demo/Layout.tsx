import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/demo/Sidebar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "../ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import gsap from "gsap";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChat } from "@/context/ChatContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import MoltenMetal from "@/components/MoltenMetal";

import { MODELS, ROLES } from "@/lib/constants";

export default function Layout({ children }: { children: React.ReactNode }) {
  const {
    modelName,
    selectedModel,
    setSelectedModel,
    selectedRole,
    setSelectedRole,
    history,
    loadChat,
    newChat,
  } = useChat();
  const { t, language, setLanguage } = useLanguage();
  const [showIntro, setShowIntro] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (showIntro) {
      gsap.fromTo(
        ".intro-element",
        { opacity: 0, y: 50, scale: 0.95, filter: "blur(12px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.4,
          stagger: 0.2,
          ease: "expo.out",
          delay: 0.3,
        },
      );
    }
  }, [showIntro]);

  return (
    <div className="flex h-screen bg-pied-bg text-pied-text overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:block h-full transition-all duration-300 ease-in-out shrink-0",
          isSidebarCollapsed ? "w-20" : "w-[232px]",
        )}
      >
        <Sidebar
          collapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed top-0 left-0 z-50 h-full w-[232px] lg:hidden border-r border-pied-border"
            >
              <Sidebar
                collapsed={false}
                toggleCollapse={() => setIsMobileMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col w-full h-full relative">
        {/* ─── Header ─── */}
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-pied-border bg-pied-bg z-10 shrink-0">
          <div className="flex items-center gap-3 lg:gap-5">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden size-8 rounded-pied bg-pied-surface border border-pied-border flex items-center justify-center hover:bg-pied-surface-2 transition-colors text-pied-muted hover:text-pied-text shrink-0"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-lg">menu</span>
            </button>

            {/* Model Selector */}
            <div className="flex flex-col">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-auto min-w-[140px] lg:min-w-[180px] border-none bg-transparent text-pied-text font-semibold text-sm focus:ring-0 p-0 h-auto gap-2 shadow-none hover:bg-transparent">
                  <div className="flex items-center gap-2">
                    <SelectValue placeholder={t("status.selectModel")} />
                    <span
                      className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"
                      aria-label="Online"
                    ></span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-pied-surface border-pied-border text-pied-text max-h-[400px] rounded-pied">
                  {MODELS.map((model) => (
                    <SelectItem
                      key={model}
                      value={model}
                      className="focus:bg-white/[0.06] focus:text-pied-text cursor-pointer text-sm"
                    >
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="hidden lg:inline text-[11px] text-pied-muted font-medium">
                {t("status.systemOnline")} · {t("status.highSpeed")}
              </span>
            </div>

            {/* Role Selector */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[11px] text-pied-muted hidden lg:inline">
                Role
              </span>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[120px] lg:w-[140px] border-pied-border bg-pied-surface text-pied-text h-8 text-xs rounded-pied focus:ring-1 focus:ring-pied-accent/50">
                  <SelectValue placeholder={t("status.selectRole")} />
                </SelectTrigger>
                <SelectContent className="bg-pied-surface border-pied-border text-pied-text rounded-pied">
                  {ROLES.map((role) => (
                    <SelectItem
                      key={role}
                      value={role}
                      className="focus:bg-white/[0.06] focus:text-pied-text cursor-pointer"
                    >
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Search */}
            <div
              onClick={() => setOpen(true)}
              className="flex items-center bg-pied-surface rounded-pied px-2.5 py-1.5 lg:px-3 lg:py-1.5 border border-pied-border group hover:border-white/[0.14] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-pied-muted text-sm lg:mr-2 group-hover:text-pied-text transition-colors">
                search
              </span>
              <span className="hidden lg:inline text-xs text-pied-muted w-28 group-hover:text-pied-text/70">
                {t("common.searchPlaceholder")}
              </span>
              <kbd className="hidden xl:inline-block ml-2 pointer-events-none select-none h-5 rounded border border-pied-border bg-pied-surface-2 px-1.5 font-mono text-[10px] font-medium text-pied-muted">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>

            {/* Command Dialog (Search) */}
            <CommandDialog open={open} onOpenChange={setOpen}>
              <CommandInput
                placeholder={t("common.searchPlaceholder")}
                className="border-none focus:ring-0 text-pied-text"
              />
              <CommandList className="bg-pied-surface text-pied-text border border-pied-border">
                <CommandEmpty>{t("common.noResults")}</CommandEmpty>
                <CommandGroup
                  heading={t("common.actions")}
                  className="text-pied-muted"
                >
                  <CommandItem
                    onSelect={() => {
                      newChat();
                      setOpen(false);
                    }}
                    className="cursor-pointer text-pied-text hover:bg-white/[0.06]"
                  >
                    <span className="material-symbols-outlined mr-2 text-lg">
                      add
                    </span>
                    {t("common.newChat")}
                  </CommandItem>
                </CommandGroup>
                <CommandGroup
                  heading={t("common.history")}
                  className="text-pied-muted"
                >
                  {history.map((session) => (
                    <CommandItem
                      key={session.id}
                      onSelect={() => {
                        loadChat(session.id);
                        setOpen(false);
                      }}
                      className="cursor-pointer text-pied-text hover:bg-white/[0.06]"
                    >
                      <span className="material-symbols-outlined mr-2 text-lg">
                        chat_bubble
                      </span>
                      {session.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </CommandDialog>

            {/* Info Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="size-8 rounded-pied bg-pied-surface border border-pied-border flex items-center justify-center hover:border-white/[0.14] transition-colors"
                  aria-label="About"
                >
                  <span className="material-symbols-outlined text-pied-muted text-base hover:text-pied-text transition-colors">
                    info
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="bg-pied-surface border border-pied-border text-pied-text sm:max-w-[425px] rounded-pied">
                <DialogHeader>
                  <DialogTitle>{t("common.about")}</DialogTitle>
                  <DialogDescription className="text-pied-muted">
                    {t("common.aboutDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-3 bg-pied-surface-2 rounded-pied border border-pied-border">
                      <span className="text-sm text-pied-muted">
                        {t("common.version")}
                      </span>
                      <span className="text-sm font-mono text-pied-text">
                        v0.1.2 beta
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-pied-surface-2 rounded-pied border border-pied-border">
                      <span className="text-sm text-pied-muted">
                        {t("common.model")}
                      </span>
                      <span className="text-sm font-mono text-pied-text">
                        {modelName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-pied-surface-2 rounded-pied border border-pied-border">
                      <span className="text-sm text-pied-muted">
                        {t("common.developer")}
                      </span>
                      <span className="text-sm font-mono text-pied-text">
                        Mochrks
                      </span>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* ─── Main Content ─── */}
        <main className="flex-1 w-full relative overflow-hidden">
          <AnimatePresence mode="wait">
            {showIntro ? (
              <motion.div
                key="intro"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="fixed inset-0 z-50 overflow-hidden bg-pied-bg"
              >
                {/* Background Animation */}
                <div className="absolute inset-0 z-0 pointer-events-auto">
                  <MoltenMetal
                    color1="#030445"
                    color2="#001d82"
                    color3="#FFFFFF"
                    speed={0.55}
                    scale={3.8}
                    detail={4}
                    glow={1.75}
                    coreSize={0.1}
                    swirl={0.5}
                    fold={-0.26}
                    blackPoint={0.03}
                    brightness={1.5}
                    colorMode="molten"
                    grain
                    grainIntensity={0.07}
                    mouseInteraction
                    mouseStrength={0.2}
                    opacity={0.8}
                  />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full w-full px-4 pointer-events-none">
                  {/* Brand */}
                  <div className="flex flex-col items-center mb-10 intro-element opacity-0 pointer-events-auto">
                    <h1 className="text-7xl sm:text-8xl lg:text-[10rem] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-50 to-blue-400 pb-4">
                      Pied AI
                    </h1>
                    <span className="text-xs sm:text-sm text-blue-100/80 font-semibold tracking-[0.5em] uppercase mt-2">
                      Intelligence
                    </span>
                  </div>

                  {/* Get Started Button */}
                  <div className="intro-element opacity-0 pointer-events-auto">
                    <button
                      onClick={() => setShowIntro(false)}
                      className="group relative px-10 py-3.5 sm:px-12 sm:py-4 rounded-pied-button bg-pied-accent text-white font-semibold text-base sm:text-lg transition-all duration-200 hover:bg-pied-accent-hover active:scale-[0.97]"
                    >
                      <span className="relative z-10">
                        {t("common.getStarted")}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full relative"
              >
                <div className="mx-auto w-full h-full relative z-10">
                  {children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
