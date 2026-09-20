import React, { useState } from "react";
import { LayoutGrid, LogOut, PanelLeftClose, PanelLeftOpen, Trash2 } from "lucide-react";
import NextImage from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
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
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChat } from "@/hooks/useChat";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/utils/cn";
import { ROLES } from "@/constants/roles";
import { APP_NAME, APP_TAGLINE, APP_DEVELOPER, APP_VERSION } from "@/constants/app";
import type { SidebarProps, SidebarTooltipProps } from "@/types/components";

const SidebarTooltip = ({ children, text, collapsed, className }: SidebarTooltipProps) => (
    <div className={cn("relative group/tooltip", collapsed ? "flex w-full justify-center" : "w-full", className)}>
        {children}
        {collapsed && (
            <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-pied-surface-2 border border-pied-border text-pied-text text-[11px] font-medium rounded-pied opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 z-[100] whitespace-nowrap shadow-xl">
                {text}
            </div>
        )}
    </div>
);

export default function Sidebar({ collapsed = false, toggleCollapse }: SidebarProps) {
    const { history, loadChat, newChat, deleteChat, currentChatId, clearAllChats, selectedRole, setSelectedRole } =
        useChat();
    const { data: session } = useSession();
    const { t, language, setLanguage } = useLanguage();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    return (
        <aside
            className={cn(
                "pied-sidebar flex flex-col h-full z-20 relative transition-all duration-300",
                collapsed ? "w-20" : "w-[232px]"
            )}
        >
            <div className={cn("p-5 pb-0 flex flex-col h-full", collapsed && "p-3 items-center")}>
                <div
                    className={cn(
                        "flex relative transition-all w-full",
                        collapsed
                            ? "flex-col items-center justify-center mb-8 mt-1"
                            : "flex-col items-center justify-center gap-2 mb-6"
                    )}
                >
                    {toggleCollapse && (
                        <div
                            className={cn(
                                "flex justify-center",
                                collapsed
                                    ? "relative z-30 w-full"
                                    : "absolute right-0 top-0 translate-x-1 -translate-y-1 z-30"
                            )}
                        >
                            <SidebarTooltip text={collapsed ? "Expand Sidebar" : "Collapse Sidebar"} collapsed={collapsed}>
                                <button
                                    onClick={toggleCollapse}
                                    className="text-pied-muted hover:text-pied-text transition-colors p-1"
                                    aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                                >
                                    {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-4 w-4" />}
                                </button>
                            </SidebarTooltip>
                        </div>
                    )}

                    {!collapsed && (
                        <div className="flex flex-col items-center overflow-hidden">
                            <h2 className="text-lg font-semibold tracking-tight text-pied-text leading-none whitespace-nowrap">
                                {APP_NAME}
                            </h2>
                            <span className="text-[10px] text-pied-muted font-medium tracking-[0.15em] uppercase mt-1 whitespace-nowrap">
                                {APP_TAGLINE}
                            </span>
                        </div>
                    )}
                </div>

                {!collapsed && (
                    <div className="w-full mb-3 md:hidden">
                        <label className="text-[10px] uppercase text-pied-muted font-semibold tracking-wider mb-2 block pl-1">
                            Role
                        </label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-full border-pied-border bg-pied-surface text-pied-text h-9 text-xs rounded-pied focus:ring-1 focus:ring-pied-accent/50 hover:border-white/[0.14] transition-colors">
                                <SelectValue placeholder={t("status.selectRole")} />
                            </SelectTrigger>
                            <SelectContent className="bg-pied-surface border-pied-border text-pied-text z-50 rounded-pied">
                                {ROLES.map((role) => (
                                    <SelectItem key={role} value={role} className="focus:bg-white/[0.06] focus:text-pied-text cursor-pointer">
                                        {role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <SidebarTooltip text={t("common.newChat")} collapsed={collapsed}>
                    <button
                        onClick={newChat}
                        className={cn(
                            "flex items-center justify-center bg-pied-accent/[0.08] border border-pied-accent/30 hover:bg-pied-accent/[0.14] hover:border-pied-accent/50 transition-all rounded-pied-button text-pied-text font-medium text-sm mb-5 shrink-0 overflow-hidden",
                            collapsed ? "w-11 h-11 p-0 rounded-full gap-0" : "w-full py-2.5 gap-2"
                        )}
                        aria-label={t("common.newChat")}
                    >
                        <span className="material-symbols-outlined text-sm shrink-0">add</span>
                        <span
                            className={cn(
                                "transition-all duration-300 whitespace-nowrap overflow-hidden block",
                                collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                            )}
                        >
                            {t("common.newChat")}
                        </span>
                    </button>
                </SidebarTooltip>

                <div className="flex flex-col gap-0.5 flex-1 overflow-hidden w-full">
                    <p
                        className={cn(
                            "text-[10px] uppercase tracking-[0.12em] text-pied-muted font-semibold mb-2 ml-2 truncate transition-all duration-300",
                            collapsed ? "opacity-0 h-0 mb-0" : "opacity-100"
                        )}
                    >
                        {t("common.history")}
                    </p>

                    <div className="flex-1 overflow-y-auto pr-1 no-scrollbar w-full">
                        {history.length === 0 && !collapsed && (
                            <div className="flex flex-col items-center justify-center h-20 text-pied-muted gap-2 opacity-50">
                                <LayoutGrid className="w-5 h-5" />
                                <span className="text-xs">{t("common.noResults")}</span>
                            </div>
                        )}
                        <div className="flex flex-col gap-1 w-full">
                            {history.map((chat) => (
                                <SidebarTooltip key={chat.id} text={chat.title || "Untitled"} collapsed={collapsed}>
                                    <div
                                        onClick={() => loadChat(chat.id)}
                                        className={cn(
                                            "flex items-center px-2.5 py-2 rounded-pied transition-all cursor-pointer group/item relative w-full",
                                            currentChatId === chat.id
                                                ? "bg-pied-surface-2 text-pied-text"
                                                : "text-pied-muted hover:bg-white/[0.03] hover:text-pied-text",
                                            collapsed ? "justify-center px-0 py-2.5 gap-0" : "gap-2.5"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "material-symbols-outlined text-[18px] shrink-0",
                                                currentChatId === chat.id ? "text-pied-accent" : ""
                                            )}
                                        >
                                            {currentChatId === chat.id ? "chat_bubble" : "database"}
                                        </span>
                                        <div
                                            className={cn(
                                                "flex items-center overflow-hidden transition-all duration-300",
                                                collapsed ? "w-0 opacity-0" : "flex-1 opacity-100"
                                            )}
                                        >
                                            <p className="text-[13px] font-medium truncate flex-1">
                                                {chat.title || "Untitled Conversation"}
                                            </p>
                                            <button
                                                className="opacity-0 group-hover/item:opacity-100 p-0.5 hover:text-red-400 transition-all shrink-0 ml-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteChat(chat.id);
                                                }}
                                                aria-label="Delete conversation"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </SidebarTooltip>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={cn("mt-auto space-y-3 shrink-0 w-full", collapsed ? "pt-3" : "p-0 pt-3")}>
                    <div
                        className={cn(
                            "bg-pied-surface rounded-pied border border-pied-border mx-auto transition-all duration-300 overflow-hidden",
                            collapsed ? "h-0 opacity-0 p-0 border-0 mb-0" : "h-auto opacity-100 p-3.5 mb-3 w-full"
                        )}
                    >
                        <p className="text-xs text-pied-muted mb-2.5 whitespace-nowrap">Plan: Free Trial</p>
                        <button className="w-full bg-pied-accent py-2 rounded-pied text-xs font-semibold hover:bg-pied-accent-hover transition-colors text-white whitespace-nowrap">
                            Upgrade to Pro
                        </button>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                        <SidebarTooltip text={t("common.settings")} collapsed={collapsed}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div
                                        className={cn(
                                            "flex items-center px-2.5 py-2 text-pied-muted hover:text-pied-text transition-all cursor-pointer rounded-pied hover:bg-white/[0.03] overflow-hidden w-full",
                                            collapsed ? "justify-center gap-0" : "gap-2.5"
                                        )}
                                    >
                                        <span className="material-symbols-outlined text-[18px] shrink-0">settings</span>
                                        <div
                                            className={cn(
                                                "transition-all duration-300 whitespace-nowrap overflow-hidden block",
                                                collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                                            )}
                                        >
                                            <p className="text-[13px] font-medium">{t("common.settings")}</p>
                                        </div>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side={collapsed ? "right" : "top"}
                                    sideOffset={16}
                                    className="w-56 bg-pied-surface border border-pied-border text-pied-text rounded-pied"
                                >
                                    <DropdownMenuLabel className="text-pied-text">{t("common.settings")}</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-pied-border" />
                                    <DropdownMenuItem
                                        className="text-pied-text hover:text-pied-text focus:text-pied-text focus:bg-white/[0.06] cursor-pointer flex justify-between rounded-pied-sm"
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setLanguage(language === "en" ? "id" : "en");
                                        }}
                                    >
                                        <div className="flex items-center">
                                            <span className="material-symbols-outlined mr-2 text-[16px]">language</span>
                                            <span className="text-[13px]">Language</span>
                                        </div>
                                        <span className="font-mono text-[11px] text-pied-muted bg-pied-surface-2 px-1.5 py-0.5 rounded border border-pied-border uppercase">
                                            {language}
                                        </span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-pied-border" />
                                    <DropdownMenuItem
                                        className="text-red-400 focus:text-red-400 focus:bg-white/[0.06] cursor-pointer rounded-pied-sm"
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setIsDeleteDialogOpen(true);
                                        }}
                                    >
                                        <span className="material-symbols-outlined mr-2 text-[16px]">delete_sweep</span>
                                        <span className="text-[13px]">Clear History</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarTooltip>

                        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <AlertDialogContent className="bg-pied-surface border border-pied-border text-pied-text rounded-pied">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete All History?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-pied-muted">
                                        This action cannot be undone. This will permanently delete your entire chat history from this device.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-transparent border-pied-border text-pied-text hover:bg-white/[0.06] hover:text-pied-text rounded-pied">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700 text-white border-0 rounded-pied"
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
                            <AlertDialogContent className="bg-pied-surface border border-pied-border text-pied-text rounded-pied">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Log out?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-pied-muted">
                                        Are you sure you want to sign out of your account?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-transparent border-pied-border text-pied-text hover:bg-white/[0.06] hover:text-pied-text rounded-pied">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-pied-accent hover:bg-pied-accent-hover text-white border-0 rounded-pied"
                                        onClick={() => {
                                            signOut({ callbackUrl: "/" });
                                            setIsLogoutDialogOpen(false);
                                        }}
                                    >
                                        Log out
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <div
                            className={cn(
                                "flex items-center gap-3 px-2.5 py-2.5 border-t border-pied-border pt-3 w-full",
                                collapsed && "flex-col border-none pt-2 px-0"
                            )}
                        >
                            {session ? (
                                <>
                                    <div className="size-8 shrink-0 rounded-pied bg-cover bg-center border border-pied-border relative overflow-hidden">
                                        {session.user?.image ? (
                                            <NextImage
                                                src={session.user.image}
                                                alt={session.user.name || "User"}
                                                width={32}
                                                height={32}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-pied-surface-2 flex items-center justify-center text-pied-muted text-xs font-semibold">
                                                {(session.user?.name || "U").charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className={cn(
                                            "flex flex-col overflow-hidden transition-all duration-300",
                                            collapsed ? "w-0 opacity-0 hidden" : "flex-1 opacity-100"
                                        )}
                                    >
                                        <p className="text-[13px] font-semibold text-pied-text truncate">
                                            {session.user?.name || "User"}
                                        </p>
                                        <p className="text-[10px] text-pied-muted truncate">{session.user?.email}</p>
                                    </div>
                                    <SidebarTooltip text="Logout" collapsed={collapsed} className={cn(!collapsed && "w-auto")}>
                                        <button
                                            onClick={() => setIsLogoutDialogOpen(true)}
                                            className={cn(
                                                "text-pied-muted hover:text-pied-text transition-colors flex items-center justify-center p-1",
                                                collapsed && "mt-1"
                                            )}
                                            aria-label="Logout"
                                        >
                                            <LogOut className="h-4 w-4" />
                                        </button>
                                    </SidebarTooltip>
                                </>
                            ) : (
                                <SidebarTooltip text="Login with Google" collapsed={collapsed}>
                                    <button
                                        onClick={() => signIn("google")}
                                        className={cn(
                                            "flex items-center justify-center bg-pied-surface hover:bg-pied-surface-2 text-pied-text rounded-pied transition-all duration-300 border border-pied-border hover:border-white/[0.14] overflow-hidden w-full",
                                            collapsed ? "size-10 gap-0" : "py-2.5 gap-3 text-[13px] font-semibold"
                                        )}
                                    >
                                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        <span
                                            className={cn(
                                                "transition-all duration-300 whitespace-nowrap overflow-hidden block",
                                                collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                                            )}
                                        >
                                            Continue with Google
                                        </span>
                                    </button>
                                </SidebarTooltip>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
