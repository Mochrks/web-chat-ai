import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageCircle, Trash2, LayoutGrid, Clock, LogIn, LogOut, Settings as SettingsIcon, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import NextImage from 'next/image';
import { useChat } from '@/context/ChatContext';
import { useSession, signIn, signOut } from "next-auth/react";
import { useLanguage } from '@/context/LanguageContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SidebarProps {
    collapsed?: boolean;
    toggleCollapse?: () => void;
}

export default function Sidebar({ collapsed = false, toggleCollapse }: SidebarProps) {
    const { history, loadChat, newChat, deleteChat, currentChatId, clearAllChats } = useChat();
    const { data: session } = useSession();
    const { t, language, setLanguage } = useLanguage();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    return (
        <aside className={cn(
            "glass-sidebar flex flex-col h-full z-20 relative overflow-hidden transition-all duration-300",
            collapsed ? "w-20" : "w-72"
        )}>
            <div className={cn("p-6 pb-0 flex flex-col h-full", collapsed && "p-4 items-center")}>
                {/* Header / Logo Area */}
                <div className={cn(
                    "flex relative transition-all w-full",
                    collapsed ? "flex-col gap-4 items-center justify-center mb-4" : "flex-col items-center justify-center gap-3 mb-8"
                )}>
                    {toggleCollapse && (
                        <button
                            onClick={toggleCollapse}
                            className={cn(
                                "text-slate-400 hover:text-white transition-colors absolute z-30",
                                collapsed ? "-bottom-10" : "right-0 top-0 translate-x-2 -translate-y-2 opacity-0 group-hover:opacity-100"
                            )}
                            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                        </button>
                    )}

                    <div className="size-10 shrink-0 bg-gradient-to-br from-indigo-500 via-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 z-10 border border-white/20">
                        <span className="text-white font-black text-2xl font-display">P</span>
                    </div>

                    {!collapsed && (
                        <div className="flex flex-col items-center">
                            <h2 className="text-xl font-bold tracking-tight text-white leading-none whitespace-nowrap">Pied AI</h2>
                            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1 whitespace-nowrap">Intelligence</span>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <button
                    onClick={newChat}
                    className={cn(
                        "flex items-center justify-center gap-2 bg-primary/20 border border-primary/30 hover:bg-primary/30 transition-all rounded-xl py-3 text-white font-medium mb-6 shrink-0",
                        collapsed ? "w-12 h-12 p-0 rounded-full" : "w-full"
                    )}
                    title={t('common.newChat')}
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    {!collapsed && <span>{t('common.newChat')}</span>}
                </button>

                {/* Recent History Header */}
                <div className="flex flex-col gap-1 flex-1 overflow-hidden w-full">
                    {!collapsed && (
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-2 truncate">{t('common.history')}</p>
                    )}

                    <div className="flex-1 overflow-y-auto pr-1 no-scrollbar w-full">
                        {history.length === 0 && !collapsed && (
                            <div className="flex flex-col items-center justify-center h-20 text-slate-500 gap-2 opacity-50">
                                <LayoutGrid className="w-6 h-6" />
                                <span className="text-xs">{t('common.noResults')}</span>
                            </div>
                        )}

                        <div className="flex flex-col gap-1 w-full">
                            {history.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => loadChat(chat.id)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group relative",
                                        currentChatId === chat.id
                                            ? "bg-white/5 border border-white/10 text-white"
                                            : "text-slate-400 hover:bg-white/5 hover:text-white",
                                        collapsed && "justify-center px-0 py-3"
                                    )}
                                    title={collapsed ? chat.title : undefined}
                                >
                                    <span className={cn(
                                        "material-symbols-outlined text-[20px] shrink-0",
                                        currentChatId === chat.id ? "text-primary" : ""
                                    )}>
                                        {currentChatId === chat.id ? 'chat_bubble' : 'database'}
                                    </span>

                                    {!collapsed && (
                                        <>
                                            <p className="text-sm font-medium truncate flex-1">{chat.title || "Untitled Conversation"}</p>
                                            <button
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteChat(chat.id);
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer / User Profile */}
                <div className={cn("mt-auto space-y-4 shrink-0 w-full", collapsed ? "pt-4" : "p-0 pt-4")}>
                    {!collapsed && (
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mx-auto w-full">
                            <p className="text-xs text-slate-400 mb-2">Plan: Free Trial</p>
                            <button className="w-full bg-primary py-2 rounded-lg text-xs font-bold hover:brightness-110 transition-all text-white">Upgrade to Pro</button>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 w-full">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className={cn("flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-all cursor-pointer", collapsed && "justify-center")}>
                                    <span className="material-symbols-outlined text-[20px]">settings</span>
                                    {!collapsed && <p className="text-sm font-medium">{t('common.settings')}</p>}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-black/80 backdrop-blur-xl border border-white/10 text-white rounded-xl">
                                <DropdownMenuLabel>{t('common.settings')}</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem
                                    className="text-white hover:text-white focus:text-white focus:bg-white/10 cursor-pointer flex justify-between"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        setLanguage(language === 'en' ? 'id' : 'en');
                                    }}
                                >
                                    <div className="flex items-center">
                                        <span className="material-symbols-outlined mr-2 text-[18px]">language</span>
                                        <span>Language</span>
                                    </div>
                                    <span className="font-mono text-xs text-slate-400 bg-white/10 px-1.5 py-0.5 rounded uppercase">{language}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem
                                    className="text-red-400 focus:text-red-400 focus:bg-white/10 cursor-pointer"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        setIsDeleteDialogOpen(true);
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete All Chats</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Alert Dialogs (Keep same) */}
                        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <AlertDialogContent className="bg-black/90 border border-white/10 text-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete All History?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400">
                                        This action cannot be undone. This will permanently delete your entire chat history from this device.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700 text-white border-0"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            clearAllChats();
                                            setIsDeleteDialogOpen(false);
                                        }}
                                    >
                                        Delete All
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                            <AlertDialogContent className="bg-black/90 border border-white/10 text-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Log out?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400">
                                        Are you sure you want to sign out of your account?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-primary hover:bg-primary/90 text-white border-0"
                                        onClick={() => {
                                            signOut();
                                            setIsLogoutDialogOpen(false);
                                        }}
                                    >
                                        Log out
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <div className={cn("flex items-center gap-4 px-3 py-2 border-t border-white/5 pt-4 w-full", collapsed && "flex-col border-none pt-2 px-0")}>
                            {session ? (
                                <>
                                    <div className="size-9 shrink-0 rounded-full bg-cover bg-center border border-white/20 relative overflow-hidden" >
                                        {session.user?.image ? (
                                            <NextImage src={session.user.image} alt={session.user.name || "User"} width={36} height={36} className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500" />
                                        )}
                                    </div>
                                    {!collapsed && (
                                        <div className="flex flex-col overflow-hidden flex-1">
                                            <p className="text-sm font-bold text-white truncate">{session.user?.name || "User"}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{session.user?.email}</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setIsLogoutDialogOpen(true)}
                                        className={cn("text-slate-500 hover:text-white transition-colors", collapsed && "mt-2")}
                                        title="Logout"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </>
                            ) : (
                                !collapsed ? (
                                    <div className="relative group w-full cursor-pointer" onClick={() => signIn('google')}>
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05] rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
                                        <button
                                            className="relative w-full flex items-center justify-center gap-3 bg-black hover:bg-zinc-900 text-white py-3 rounded-xl text-xs font-bold transition-all border border-white/10"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            <span className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">Login with Google</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => signIn('google')}
                                        className="size-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 group relative overflow-hidden"
                                        title="Login with Google"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-tr from-[#4285F4]/20 via-[#EA4335]/20 to-[#FBBC05]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}