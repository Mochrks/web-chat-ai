import React, { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/demo/Sidebar'
import Ripple from "@/components/ui/ripple";
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '../ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useChat } from '@/context/ChatContext';
import { useLanguage } from '@/context/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"
import { motion, AnimatePresence } from "framer-motion"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { WavyBackground } from "@/components/ui/wavy-background"
import { Spotlight } from "@/components/ui/spotlight"

import { MODELS, ROLES } from '@/lib/constants';

export default function Layout({ children }: { children: React.ReactNode }) {
    const { modelName, selectedModel, setSelectedModel, selectedRole, setSelectedRole, history, loadChat, newChat } = useChat()
    const { t, language, setLanguage } = useLanguage();
    const [showIntro, setShowIntro] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [open, setOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Show intro for 3 seconds then fade out
        const timer = setTimeout(() => setShowIntro(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <div className="flex h-screen mesh-gradient text-white overflow-hidden font-display">
            {/* sidebar */}
            <div className={cn(
                'hidden lg:block h-full transition-all duration-300 ease-in-out',
                isSidebarCollapsed ? 'w-20' : 'w-72'
            )}>
                <Sidebar collapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="fixed top-0 left-0 z-50 h-full w-72 lg:hidden shadow-2xl"
                        >
                            <Sidebar collapsed={false} toggleCollapse={() => setIsMobileMenuOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* main area */}
            <div className='flex flex-col w-full h-full relative'>
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/5 bg-background-dark/20 backdrop-blur-md z-10 shrink-0">
                    <div className="flex items-center gap-3 lg:gap-6">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-slate-400 hover:text-white shrink-0"
                        >
                            <span className="material-symbols-outlined text-lg">menu</span>
                        </button>

                        {/* Model Selector */}
                        <div className="flex flex-col">
                            <Select value={selectedModel} onValueChange={setSelectedModel}>
                                <SelectTrigger className="w-auto min-w-[140px] lg:min-w-[180px] border-none bg-transparent text-white font-bold text-sm lg:text-lg focus:ring-0 p-0 h-auto gap-2 shadow-none hover:bg-transparent">
                                    <div className="flex items-center gap-2">
                                        <SelectValue placeholder={t('status.selectModel')} />
                                        <span className="flex h-1.5 w-1.5 lg:h-2 lg:w-2 rounded-full bg-green-500 animate-pulse"></span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 border-white/10 text-white max-h-[400px]">
                                    {MODELS.map(model => (
                                        <SelectItem key={model} value={model} className="focus:bg-white/10 focus:text-white cursor-pointer">{model}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="hidden lg:inline text-[10px] text-slate-500 font-medium">{t('status.systemOnline')} • {t('status.highSpeed')}</span>
                        </div>

                        {/* Role Selector - Hidden on very small screens if needed, or condensed */}
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-xs text-slate-400 hidden lg:inline">{t('common.role')}:</span>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="w-[120px] lg:w-[140px] border-white/10 bg-white/5 text-white h-8 text-xs rounded-lg">
                                    <SelectValue placeholder={t('status.selectRole')} />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 border-white/10 text-white">
                                    {ROLES.map(role => (
                                        <SelectItem key={role} value={role} className="focus:bg-white/10 focus:text-white cursor-pointer">{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4">
                        <div
                            onClick={() => setOpen(true)}
                            className="flex items-center bg-white/5 rounded-full px-2.5 py-1.5 lg:px-3 lg:py-1.5 border border-white/10 group hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-slate-400 text-sm lg:mr-2 group-hover:text-white transition-colors">search</span>
                            <span className="hidden lg:inline text-xs text-slate-500 w-32 group-hover:text-slate-300">{t('common.searchPlaceholder')}</span>
                            <kbd className="hidden xl:inline-block ml-2 pointer-events-none select-none h-5 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-50">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>

                        <CommandDialog open={open} onOpenChange={setOpen}>
                            <CommandInput placeholder={t('common.searchPlaceholder')} className="border-none focus:ring-0 text-white" />
                            <CommandList className="bg-black/90 text-white border border-white/10">
                                <CommandEmpty>{t('common.noResults')}</CommandEmpty>
                                <CommandGroup heading={t('common.actions')} className="text-slate-400">
                                    <CommandItem onSelect={() => { newChat(); setOpen(false) }} className="cursor-pointer text-white hover:bg-white/10">
                                        <span className="material-symbols-outlined mr-2 text-lg">add</span>
                                        {t('common.newChat')}
                                    </CommandItem>
                                </CommandGroup>
                                <CommandGroup heading={t('common.history')} className="text-slate-400">
                                    {history.map(session => (
                                        <CommandItem
                                            key={session.id}
                                            onSelect={() => { loadChat(session.id); setOpen(false) }}
                                            className="cursor-pointer text-white hover:bg-white/10"
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
                                <button className="size-8 lg:size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                                    <span className="material-symbols-outlined text-white text-base lg:text-lg">info</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="bg-black/90 border border-white/10 text-white sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>{t('common.about')}</DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        {t('common.aboutDescription')}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className='flex flex-col gap-2'>
                                        <div className='flex items-center justify-between p-3 bg-white/5 rounded-lg'>
                                            <span className='text-sm text-slate-300'>{t('common.version')}</span>
                                            <span className='text-sm font-mono'>v0.1.2 beta</span>
                                        </div>
                                        <div className='flex items-center justify-between p-3 bg-white/5 rounded-lg'>
                                            <span className='text-sm text-slate-300'>{t('common.model')}</span>
                                            <span className='text-sm font-mono'>{modelName}</span>
                                        </div>
                                        <div className='flex items-center justify-between p-3 bg-white/5 rounded-lg'>
                                            <span className='text-sm text-slate-300'>{t('common.developer')}</span>
                                            <span className='text-sm font-mono'>Mochrks</span>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                </header>

                {/* main content */}
                <main className="flex-1 w-full relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {showIntro ? (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8 }}
                                className="fixed inset-0 z-50 bg-black overflow-hidden"
                            >
                                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
                                <WavyBackground
                                    className="max-w-5xl mx-auto flex flex-col items-center justify-center h-full"
                                    containerClassName="bg-[#0a0a0f]"
                                    backgroundFill="#0a0a0f"
                                    colors={["#2563eb", "#7c3aed", "#db2777", "#4f46e5", "#3b82f6"]}
                                    waveWidth={50}
                                    blur={10}
                                >
                                    <div className="h-48 sm:h-64 lg:h-96 w-full relative z-10 px-4">
                                        <TextHoverEffect text="Pied AI" />
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1.5, duration: 1 }}
                                            className="text-center mt-4 sm:mt-8"
                                        >
                                            <span className="text-slate-400 text-sm sm:text-lg md:text-xl font-light tracking-[0.2em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-slate-500 via-slate-200 to-slate-500 animate-gradient-x">
                                                Next Gen Intelligence
                                            </span>
                                        </motion.div>
                                    </div>
                                </WavyBackground>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-full relative"
                            >
                                <Ripple />
                                <div className='mx-auto w-full h-full relative z-10'>
                                    {children}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div >

        </div >
    )
}