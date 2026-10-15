import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import Sidebar from "@/components/demo/Sidebar";
import MoltenMetal from "@/components/demo/MoltenMetal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useChat } from "@/hooks/useChat";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/utils/cn";
import { APP_NAME, APP_TAGLINE, APP_VERSION, APP_DEVELOPER } from "@/constants/app";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { modelName, selectedRole, history, loadChat, newChat } = useChat();
  const { t, language, setLanguage } = useLanguage();

  const [showIntro, setShowIntro] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
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
        }
      );
    }
  }, [showIntro]);

  return (
    <div className="flex h-screen overflow-hidden bg-pied-bg font-sans text-pied-text">
      <div
        className={cn(
          "hidden h-full shrink-0 transition-all duration-300 ease-in-out lg:block",
          isSidebarCollapsed ? "w-20" : "w-[232px]"
        )}
      >
        <Sidebar
          collapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

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
              className="fixed left-0 top-0 z-50 h-full w-[232px] border-r border-pied-border lg:hidden"
            >
              <Sidebar collapsed={false} toggleCollapse={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="relative flex h-full w-full flex-col">
        <header className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-pied-border bg-pied-bg px-4 lg:px-6">
          <div className="flex items-center gap-3 lg:gap-5">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex size-8 shrink-0 items-center justify-center rounded-pied border border-pied-border bg-pied-surface text-pied-muted transition-colors hover:bg-pied-surface-2 hover:text-pied-text lg:hidden"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-lg">menu</span>
            </button>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <div
              onClick={() => setOpen(true)}
              className="group flex cursor-pointer items-center rounded-pied border border-pied-border bg-pied-surface px-2.5 py-1.5 transition-colors hover:border-white/[0.14] lg:px-3 lg:py-1.5"
            >
              <span className="material-symbols-outlined text-sm text-pied-muted transition-colors group-hover:text-pied-text lg:mr-2">
                search
              </span>
              <span className="hidden w-28 text-xs text-pied-muted group-hover:text-pied-text/70 lg:inline">
                {t("common.searchPlaceholder")}
              </span>
              <kbd className="pointer-events-none ml-2 hidden h-5 select-none rounded border border-pied-border bg-pied-surface-2 px-1.5 font-mono text-[10px] font-medium text-pied-muted xl:inline-block">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>

            <CommandDialog open={open} onOpenChange={setOpen}>
              <CommandInput
                placeholder={t("common.searchPlaceholder")}
                className="border-none text-pied-text focus:ring-0"
              />
              <CommandList className="border border-pied-border bg-pied-surface text-pied-text">
                <CommandEmpty>{t("common.noResults")}</CommandEmpty>
                <CommandGroup heading={t("common.actions")} className="text-pied-muted">
                  <CommandItem
                    onSelect={() => {
                      newChat();
                      setOpen(false);
                    }}
                    className="cursor-pointer text-pied-text hover:bg-white/[0.06]"
                  >
                    <span className="material-symbols-outlined mr-2 text-lg">add</span>
                    {t("common.newChat")}
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading={t("common.history")} className="text-pied-muted">
                  {history.map((session) => (
                    <CommandItem
                      key={session.id}
                      onSelect={() => {
                        loadChat(session.id);
                        setOpen(false);
                      }}
                      className="cursor-pointer text-pied-text hover:bg-white/[0.06]"
                    >
                      <span className="material-symbols-outlined mr-2 text-lg">chat_bubble</span>
                      {session.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </CommandDialog>

            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="flex size-8 items-center justify-center rounded-pied border border-pied-border bg-pied-surface transition-colors hover:border-white/[0.14]"
                  aria-label="About"
                >
                  <span className="material-symbols-outlined text-base text-pied-muted transition-colors hover:text-pied-text">
                    info
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="rounded-pied border border-pied-border bg-pied-surface text-pied-text sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t("common.about")}</DialogTitle>
                  <DialogDescription className="text-pied-muted">
                    {t("common.aboutDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="flex flex-col gap-2">
                    {[
                      { label: t("common.version"), value: APP_VERSION },
                      { label: t("common.model"), value: modelName },
                      { label: t("common.developer"), value: APP_DEVELOPER },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between rounded-pied border border-pied-border bg-pied-surface-2 p-3"
                      >
                        <span className="text-sm text-pied-muted">{label}</span>
                        <span className="font-mono text-sm text-pied-text">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="relative w-full flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {showIntro ? (
              <motion.div
                key="intro"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="fixed inset-0 z-50 overflow-hidden bg-pied-bg"
              >
                <div className="pointer-events-auto absolute inset-0 z-0">
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

                <div className="pointer-events-none relative z-10 flex h-full w-full flex-col items-center justify-center px-4">
                  <div className="intro-element pointer-events-auto mb-10 flex flex-col items-center opacity-0">
                    <h1 className="bg-gradient-to-br from-white via-blue-50 to-blue-400 bg-clip-text pb-4 text-7xl font-bold tracking-tighter text-transparent sm:text-8xl lg:text-[10rem]">
                      {APP_NAME}
                    </h1>
                    <span className="mt-2 text-xs font-semibold uppercase tracking-[0.5em] text-blue-100/80 sm:text-sm">
                      {APP_TAGLINE}
                    </span>
                  </div>

                  <div className="intro-element pointer-events-auto opacity-0">
                    <button
                      onClick={() => setShowIntro(false)}
                      className="group relative rounded-pied-button bg-pied-accent px-10 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-pied-accent-hover active:scale-[0.97] sm:px-12 sm:py-4 sm:text-lg"
                    >
                      <span className="relative z-10">{t("common.getStarted")}</span>
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
                className="relative h-full w-full"
              >
                <div className="relative z-10 mx-auto h-full w-full">{children}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
