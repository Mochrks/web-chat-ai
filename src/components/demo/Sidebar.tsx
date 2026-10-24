import React, { useState } from "react";
import {
  LayoutGrid,
  LogOut,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
} from "lucide-react";
import NextImage from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
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
import { useChat } from "@/hooks/useChat";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/utils/cn";
import { APP_NAME, APP_TAGLINE } from "@/constants/app";
import SettingsModal from "@/components/demo/SettingsModal";
import type { SidebarProps, SidebarTooltipProps } from "@/types/components";

const SidebarTooltip = ({ children, text, collapsed, className }: SidebarTooltipProps) => (
  <div
    className={cn(
      "group/tooltip relative",
      collapsed ? "flex w-full justify-center" : "w-full",
      className
    )}
  >
    {children}
    {collapsed && (
      <div className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-[100] -translate-y-1/2 whitespace-nowrap rounded-pied border border-pied-border bg-pied-surface-2 px-2.5 py-1.5 text-[11px] font-medium text-pied-text opacity-0 shadow-xl transition-opacity duration-200 group-hover/tooltip:opacity-100">
        {text}
      </div>
    )}
  </div>
);

export default function Sidebar({ collapsed = false, toggleCollapse }: SidebarProps) {
  const { history, loadChat, newChat, deleteChat, currentChatId } = useChat();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleNewChat = () => {
    newChat();
    if (toggleCollapse && typeof window !== "undefined" && window.innerWidth < 1024) {
      toggleCollapse();
    }
  };

  const handleLoadChat = (id: string) => {
    loadChat(id);
    if (toggleCollapse && typeof window !== "undefined" && window.innerWidth < 1024) {
      toggleCollapse();
    }
  };

  return (
    <>
      <aside
        className={cn(
          "pied-sidebar relative z-20 flex h-full flex-col transition-all duration-300",
          collapsed ? "w-20" : "w-[232px]"
        )}
      >
        <div className={cn("flex h-full flex-col p-5 pb-0", collapsed && "items-center p-3")}>
          {/* ── Header ── */}
          <div
            className={cn(
              "relative flex w-full transition-all",
              collapsed
                ? "mb-8 mt-1 flex-col items-center justify-center"
                : "mb-6 flex-col items-center justify-center gap-2"
            )}
          >
            {toggleCollapse && (
              <div
                className={cn(
                  "flex justify-center",
                  collapsed
                    ? "relative z-30 w-full"
                    : "absolute right-0 top-0 z-30 -translate-y-1 translate-x-1"
                )}
              >
                <SidebarTooltip
                  text={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                  collapsed={collapsed}
                >
                  <button
                    onClick={toggleCollapse}
                    className="p-1 text-pied-muted transition-colors hover:text-pied-text"
                    aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                  >
                    {collapsed ? (
                      <PanelLeftOpen className="h-5 w-5" />
                    ) : (
                      <PanelLeftClose className="h-4 w-4" />
                    )}
                  </button>
                </SidebarTooltip>
              </div>
            )}

            {!collapsed && (
              <div className="flex flex-col items-center overflow-hidden">
                <h2 className="whitespace-nowrap text-lg font-semibold leading-none tracking-tight text-pied-text">
                  {APP_NAME}
                </h2>
                <span className="mt-1 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.15em] text-pied-muted">
                  {APP_TAGLINE}
                </span>
              </div>
            )}
          </div>

          {/* ── New Chat ── */}
          <SidebarTooltip text={t("common.newChat")} collapsed={collapsed}>
            <button
              onClick={handleNewChat}
              className={cn(
                "mb-5 flex shrink-0 items-center justify-center overflow-hidden rounded-pied-button border border-pied-accent/30 bg-pied-accent/[0.08] text-sm font-medium text-pied-text transition-all hover:border-pied-accent/50 hover:bg-pied-accent/[0.14]",
                collapsed ? "h-11 w-11 gap-0 rounded-full p-0" : "w-full gap-2 py-2.5"
              )}
              aria-label={t("common.newChat")}
            >
              <span className="material-symbols-outlined shrink-0 text-sm">add</span>
              <span
                className={cn(
                  "block overflow-hidden whitespace-nowrap transition-all duration-300",
                  collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
              >
                {t("common.newChat")}
              </span>
            </button>
          </SidebarTooltip>

          {/* ── History ── */}
          <div className="flex w-full flex-1 flex-col gap-0.5 overflow-hidden">
            <p
              className={cn(
                "mb-2 ml-2 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-pied-muted transition-all duration-300",
                collapsed ? "mb-0 h-0 opacity-0" : "opacity-100"
              )}
            >
              {t("common.history")}
            </p>

            <div className="no-scrollbar w-full flex-1 overflow-y-auto pr-1">
              {history.length === 0 && !collapsed && (
                <div className="flex h-20 flex-col items-center justify-center gap-2 text-pied-muted opacity-50">
                  <LayoutGrid className="h-5 w-5" />
                  <span className="text-xs">{t("common.noResults")}</span>
                </div>
              )}
              <div className="flex w-full flex-col gap-1">
                {history.map((chat) => (
                  <SidebarTooltip
                    key={chat.id}
                    text={chat.title || "Untitled"}
                    collapsed={collapsed}
                  >
                    <div
                      onClick={() => handleLoadChat(chat.id)}
                      className={cn(
                        "group/item relative flex w-full cursor-pointer items-center rounded-pied px-2.5 py-2 transition-all",
                        currentChatId === chat.id
                          ? "bg-pied-surface-2 text-pied-text"
                          : "text-pied-muted hover:bg-white/[0.03] hover:text-pied-text",
                        collapsed ? "justify-center gap-0 px-0 py-2.5" : "gap-2.5"
                      )}
                    >
                      {/* ── History icon — replaced "database" ── */}
                      <MessageSquare
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          currentChatId === chat.id ? "text-pied-accent" : ""
                        )}
                      />
                      <div
                        className={cn(
                          "flex items-center overflow-hidden transition-all duration-300",
                          collapsed ? "w-0 opacity-0" : "flex-1 opacity-100"
                        )}
                      >
                        <p className="flex-1 truncate text-[13px] font-medium">
                          {chat.title || "Untitled Conversation"}
                        </p>
                        <button
                          className="ml-1 shrink-0 p-0.5 opacity-0 transition-all hover:text-red-400 group-hover/item:opacity-100"
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

          {/* ── Bottom section ── */}
          <div className={cn("mt-auto w-full shrink-0 space-y-3", collapsed ? "pt-3" : "p-0 pt-3")}>
            <div className="flex w-full flex-col gap-1.5">
              {/* ── Settings button → opens modal ── */}
              <SidebarTooltip text={t("common.settings")} collapsed={collapsed}>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className={cn(
                    "flex w-full cursor-pointer items-center overflow-hidden rounded-pied px-2.5 py-2 text-pied-muted transition-all hover:bg-white/[0.03] hover:text-pied-text",
                    collapsed ? "justify-center gap-0" : "gap-2.5"
                  )}
                >
                  <span className="material-symbols-outlined shrink-0 text-[18px]">settings</span>
                  <div
                    className={cn(
                      "block overflow-hidden whitespace-nowrap transition-all duration-300",
                      collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    )}
                  >
                    <p className="text-[13px] font-medium">{t("common.settings")}</p>
                  </div>
                </button>
              </SidebarTooltip>

              {/* ── Logout dialog ── */}
              <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <AlertDialogContent className="rounded-pied border border-pied-border bg-pied-surface text-pied-text">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Log out?</AlertDialogTitle>
                    <AlertDialogDescription className="text-pied-muted">
                      Are you sure you want to sign out of your account?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-pied border-pied-border bg-transparent text-pied-text hover:bg-white/[0.06] hover:text-pied-text">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-pied border-0 bg-pied-accent text-white hover:bg-pied-accent-hover"
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

              {/* ── User row ── */}
              <div
                className={cn(
                  "flex w-full items-center gap-3 border-t border-pied-border px-2.5 py-2.5 pt-3",
                  collapsed && "flex-col border-none px-0 pt-2"
                )}
              >
                {session ? (
                  <>
                    {/* Avatar — clicking opens profile in settings */}
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="relative size-8 shrink-0 overflow-hidden rounded-pied border border-pied-border bg-cover bg-center transition-all hover:ring-2 hover:ring-pied-accent/40"
                      aria-label="Open settings"
                    >
                      {session.user?.image ? (
                        <NextImage
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-pied-surface-2 text-xs font-semibold text-pied-muted">
                          {(session.user?.name || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </button>
                    <div
                      className={cn(
                        "flex flex-col overflow-hidden transition-all duration-300",
                        collapsed ? "hidden w-0 opacity-0" : "flex-1 opacity-100"
                      )}
                    >
                      <p className="truncate text-[13px] font-semibold text-pied-text">
                        {session.user?.name || "User"}
                      </p>
                      <p className="truncate text-[10px] text-pied-muted">{session.user?.email}</p>
                    </div>
                    <SidebarTooltip
                      text="Logout"
                      collapsed={collapsed}
                      className={cn(!collapsed && "w-auto")}
                    >
                      <button
                        onClick={() => setIsLogoutDialogOpen(true)}
                        className={cn(
                          "flex items-center justify-center p-1 text-pied-muted transition-colors hover:text-pied-text",
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
                        "flex w-full items-center justify-center overflow-hidden rounded-pied border border-pied-border bg-pied-surface text-pied-text transition-all duration-300 hover:border-white/[0.14] hover:bg-pied-surface-2",
                        collapsed ? "size-10 gap-0" : "gap-3 py-2.5 text-[13px] font-semibold"
                      )}
                    >
                      <svg
                        className="h-4 w-4 shrink-0"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span
                        className={cn(
                          "block overflow-hidden whitespace-nowrap transition-all duration-300",
                          collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                        )}
                      >
                        Login with Google
                      </span>
                    </button>
                  </SidebarTooltip>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Settings Modal (rendered outside aside to avoid z-index stacking issues) ── */}
      <SettingsModal open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
