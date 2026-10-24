import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  CreditCard,
  Mic,
  HardDrive,
  MessageSquare,
  Shield,
  Palette,
  Globe,
  ChevronRight,
  ChevronLeft,
  Camera,
  Trash2,
  Download,
  ArchiveIcon,
  Check,
} from "lucide-react";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/utils/cn";
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

// ─── Types ────────────────────────────────────────────────────────────────────
type SettingsTab =
  | "profile"
  | "account"
  | "voice"
  | "storage"
  | "chat"
  | "dataControl"
  | "personalization"
  | "language";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none",
        checked ? "bg-pied-accent" : "bg-white/[0.12]"
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-[18px]" : "translate-x-[3px]"
        )}
      />
    </button>
  );
}

// ─── Setting Row ──────────────────────────────────────────────────────────────
function SettingRow({
  label,
  description,
  children,
  danger = false,
}: {
  label: string;
  description?: string;
  children?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-pied-border py-4 last:border-0",
        danger && "border-red-500/20"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className={cn("text-[13px] font-medium", danger ? "text-red-400" : "text-pied-text")}>
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-[11px] leading-relaxed text-pied-muted">{description}</p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <p className="mb-3 mt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-pied-muted first:mt-0">
      {title}
    </p>
  );
}

// ─── Panel: Profile ───────────────────────────────────────────────────────────
function ProfilePanel() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState(session?.user?.name || "");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-0">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-4 border-b border-pied-border py-6">
        <div className="group relative">
          <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-pied-border bg-pied-surface-2">
            {session?.user?.image ? (
              <NextImage
                src={session.user.image}
                alt={session.user.name || "User"}
                width={80}
                height={80}
                className="object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-pied-muted">
                {(session?.user?.name || "U").charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <button className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-5 w-5 text-white" />
          </button>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-pied-text">{session?.user?.name || "Guest"}</p>
          <p className="mt-0.5 text-[11px] text-pied-muted">
            {session?.user?.email || "Not signed in"}
          </p>
        </div>
      </div>

      {/* Fields */}
      <SectionHeader title={t("settings.editProfile")} />

      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-pied-muted">
            {t("settings.displayName")}
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t("settings.displayName")}
            className="w-full rounded-pied border border-pied-border bg-pied-surface-2 px-3 py-2.5 text-sm text-pied-text transition-colors placeholder:text-pied-muted/50 focus:border-pied-accent/60 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-pied-muted">
            {t("settings.bio")}
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell us a little about yourself..."
            className="w-full resize-none rounded-pied border border-pied-border bg-pied-surface-2 px-3 py-2.5 text-sm text-pied-text transition-colors placeholder:text-pied-muted/50 focus:border-pied-accent/60 focus:outline-none"
          />
        </div>
        <button
          onClick={handleSave}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-pied py-2.5 text-sm font-semibold transition-all",
            saved
              ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
              : "bg-pied-accent text-white hover:bg-pied-accent-hover"
          )}
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            t("settings.saveChanges")
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Panel: Account ───────────────────────────────────────────────────────────
function AccountPanel() {
  const { data: session } = useSession();
  const { t } = useLanguage();

  return (
    <div>
      <SectionHeader title={t("settings.account")} />
      <SettingRow label={t("settings.email")}>
        <span className="rounded border border-pied-border bg-pied-surface-2 px-2.5 py-1 font-mono text-[12px] text-pied-muted">
          {session?.user?.email || "—"}
        </span>
      </SettingRow>
      <SettingRow label={t("settings.plan")}>
        <span className="rounded-full border border-pied-accent/25 bg-pied-accent/10 px-2.5 py-1 text-[11px] font-semibold text-pied-accent">
          {t("settings.freePlan")}
        </span>
      </SettingRow>

      <div className="mt-4">
        <button className="w-full rounded-pied bg-pied-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pied-accent-hover">
          {t("settings.upgradeNow")} → Pro
        </button>
        <p className="mt-2 text-center text-[11px] text-pied-muted">
          Unlock unlimited messages, priority support & more.
        </p>
      </div>

      <SectionHeader title={t("settings.dangerZone")} />
      <div className="rounded-pied border border-red-500/25 bg-red-500/[0.04] p-4">
        <SettingRow
          label={t("settings.deleteAccount")}
          description={t("settings.deleteAccountDesc")}
          danger
        >
          <button className="rounded-pied border border-red-500/30 px-3 py-1.5 text-[12px] font-semibold text-red-400 transition-colors hover:border-red-400/50 hover:text-red-300">
            {t("settings.deleteAccount")}
          </button>
        </SettingRow>
      </div>
    </div>
  );
}

// ─── Panel: Voice ─────────────────────────────────────────────────────────────
function VoicePanel() {
  const { t } = useLanguage();
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);

  return (
    <div>
      <SectionHeader title={t("settings.voice")} />
      <SettingRow label={t("settings.autoSpeak")} description={t("settings.autoSpeakDesc")}>
        <Toggle checked={autoSpeak} onChange={setAutoSpeak} />
      </SettingRow>

      <SettingRow label={t("settings.voiceLanguage")}>
        <select className="rounded-pied border border-pied-border bg-pied-surface-2 px-2.5 py-1.5 text-[12px] text-pied-text focus:border-pied-accent/60 focus:outline-none">
          <option value="en-US">English (US)</option>
          <option value="en-GB">English (UK)</option>
          <option value="id-ID">Bahasa Indonesia</option>
          <option value="ja-JP">Japanese</option>
          <option value="zh-CN">Chinese (Simplified)</option>
        </select>
      </SettingRow>

      <SettingRow label={t("settings.voiceSpeed")}>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-24 accent-pied-accent"
          />
          <span className="w-8 text-right font-mono text-[12px] text-pied-muted">
            {speed.toFixed(1)}x
          </span>
        </div>
      </SettingRow>

      <SettingRow label={t("settings.voicePitch")}>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-24 accent-pied-accent"
          />
          <span className="w-8 text-right font-mono text-[12px] text-pied-muted">
            {pitch.toFixed(1)}x
          </span>
        </div>
      </SettingRow>
    </div>
  );
}

// ─── Panel: Storage ───────────────────────────────────────────────────────────
function StoragePanel() {
  const { t } = useLanguage();
  const usedMB = 12.4;
  const totalMB = 500;
  const pct = (usedMB / totalMB) * 100;

  return (
    <div>
      <SectionHeader title={t("settings.storage")} />

      {/* Usage bar */}
      <div className="mb-2 rounded-pied border border-pied-border bg-pied-surface-2 p-4">
        <div className="mb-2 flex justify-between text-[12px]">
          <span className="text-pied-muted">{t("settings.used")}</span>
          <span className="font-mono font-medium text-pied-text">
            {usedMB} MB / {totalMB} MB
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-pied-accent transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-pied-muted">
          {pct.toFixed(1)}% of {t("settings.total").toLowerCase()} storage used
        </p>
      </div>

      <SettingRow label={t("settings.clearCache")} description={t("settings.clearCacheDesc")}>
        <button className="rounded-pied border border-pied-border px-3 py-1.5 text-[12px] font-semibold text-pied-text transition-colors hover:border-white/[0.2] hover:bg-white/[0.04]">
          {t("settings.clearCache")}
        </button>
      </SettingRow>

      <SettingRow
        label={t("settings.exportData")}
        description="Download all your chat data as a JSON file."
      >
        <button className="flex items-center gap-1.5 rounded-pied border border-pied-border px-3 py-1.5 text-[12px] font-semibold text-pied-text transition-colors hover:border-white/[0.2] hover:bg-white/[0.04]">
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </SettingRow>
    </div>
  );
}

// ─── Panel: Chat ──────────────────────────────────────────────────────────────
function ChatPanel({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const { clearAllChats } = useChat();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveAllOpen, setArchiveAllOpen] = useState(false);
  const [autoArchive, setAutoArchive] = useState(false);

  return (
    <div>
      <SectionHeader title={t("settings.chat")} />

      <SettingRow label={t("settings.archiveChat")} description={t("settings.archiveChatDesc")}>
        <Toggle checked={autoArchive} onChange={setAutoArchive} />
      </SettingRow>

      <SettingRow label={t("settings.archiveAll")} description={t("settings.archiveAllDesc")}>
        <button
          onClick={() => setArchiveAllOpen(true)}
          className="flex items-center gap-1.5 rounded-pied border border-pied-border px-3 py-1.5 text-[12px] font-semibold text-pied-text transition-colors hover:border-white/[0.2] hover:bg-white/[0.04]"
        >
          <ArchiveIcon className="h-3.5 w-3.5" />
          Archive All
        </button>
      </SettingRow>

      <div className="mt-2 rounded-pied border border-red-500/25 bg-red-500/[0.04] p-4">
        <SettingRow
          label={t("settings.deleteAllChats")}
          description={t("settings.deleteAllChatsDesc")}
          danger
        >
          <button
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center gap-1.5 rounded-pied border border-red-500/30 px-3 py-1.5 text-[12px] font-semibold text-red-400 transition-colors hover:border-red-400/50 hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete All
          </button>
        </SettingRow>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-pied border border-pied-border bg-pied-surface text-pied-text">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.deleteAllChats")}</AlertDialogTitle>
            <AlertDialogDescription className="text-pied-muted">
              {t("settings.deleteAllChatsDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-pied border-pied-border bg-transparent text-pied-text hover:bg-white/[0.06] hover:text-pied-text">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-pied border-0 bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                clearAllChats();
                setDeleteDialogOpen(false);
                onClose();
              }}
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive all confirmation */}
      <AlertDialog open={archiveAllOpen} onOpenChange={setArchiveAllOpen}>
        <AlertDialogContent className="rounded-pied border border-pied-border bg-pied-surface text-pied-text">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.archiveAll")}</AlertDialogTitle>
            <AlertDialogDescription className="text-pied-muted">
              {t("settings.archiveAllDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-pied border-pied-border bg-transparent text-pied-text hover:bg-white/[0.06] hover:text-pied-text">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="rounded-pied border-0 bg-pied-accent text-white hover:bg-pied-accent-hover">
              Archive All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Panel: Data Control ──────────────────────────────────────────────────────
function DataControlPanel() {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState(true);

  return (
    <div>
      <SectionHeader title={t("settings.dataControl")} />

      <SettingRow
        label={t("settings.allowAnalytics")}
        description={t("settings.allowAnalyticsDesc")}
      >
        <Toggle checked={analytics} onChange={setAnalytics} />
      </SettingRow>

      <SettingRow label={t("settings.dataRetention")} description={t("settings.dataRetentionDesc")}>
        <select className="rounded-pied border border-pied-border bg-pied-surface-2 px-2.5 py-1.5 text-[12px] text-pied-text focus:border-pied-accent/60 focus:outline-none">
          <option value="30">30 days</option>
          <option value="90">90 days</option>
          <option value="365">1 year</option>
          <option value="forever">Forever</option>
        </select>
      </SettingRow>

      <SettingRow label={t("settings.downloadData")} description={t("settings.downloadDataDesc")}>
        <button className="flex items-center gap-1.5 rounded-pied border border-pied-border px-3 py-1.5 text-[12px] font-semibold text-pied-text transition-colors hover:border-white/[0.2] hover:bg-white/[0.04]">
          <Download className="h-3.5 w-3.5" />
          Download
        </button>
      </SettingRow>
    </div>
  );
}

// ─── Panel: Personalization ───────────────────────────────────────────────────
function PersonalizationPanel() {
  const { t } = useLanguage();
  const [compactMode, setCompactMode] = useState(false);
  const [sendWithEnter, setSendWithEnter] = useState(true);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");

  return (
    <div>
      <SectionHeader title={t("settings.personalization")} />

      <SettingRow label={t("settings.compactMode")} description={t("settings.compactModeDesc")}>
        <Toggle checked={compactMode} onChange={setCompactMode} />
      </SettingRow>

      <SettingRow label={t("settings.sendWithEnter")} description={t("settings.sendWithEnterDesc")}>
        <Toggle checked={sendWithEnter} onChange={setSendWithEnter} />
      </SettingRow>

      <SettingRow label={t("settings.fontSize")}>
        <div className="flex items-center gap-1">
          {(["sm", "md", "lg"] as const).map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={cn(
                "rounded-pied border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                fontSize === size
                  ? "border-pied-accent/50 bg-pied-accent/20 text-pied-accent"
                  : "border-pied-border bg-transparent text-pied-muted hover:border-white/[0.2] hover:text-pied-text"
              )}
            >
              {size.toUpperCase()}
            </button>
          ))}
        </div>
      </SettingRow>

      <SettingRow label={t("settings.theme")}>
        <div className="flex items-center gap-2">
          <button
            className="h-6 w-6 rounded-full border-2 border-pied-accent bg-[#0a0a0f] ring-2 ring-pied-accent/30"
            title="Dark"
          />
          <button
            className="h-6 w-6 rounded-full border-2 border-pied-border bg-[#1a1a2e] transition-colors hover:border-white/[0.2]"
            title="Deep Blue"
          />
          <button
            className="h-6 w-6 rounded-full border-2 border-pied-border bg-[#0d1117] transition-colors hover:border-white/[0.2]"
            title="Midnight"
          />
        </div>
      </SettingRow>
    </div>
  );
}

// ─── Panel: Language ──────────────────────────────────────────────────────────
function LanguagePanel() {
  const { t, language, setLanguage } = useLanguage();

  const languages = [
    { code: "en", label: "English", native: "English", flag: "🇺🇸" },
    { code: "id", label: "Indonesian", native: "Bahasa Indonesia", flag: "🇮🇩" },
  ] as const;

  return (
    <div>
      <SectionHeader title={t("settings.selectLanguage")} />
      <div className="flex flex-col gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={cn(
              "flex items-center gap-3 rounded-pied border p-3.5 text-left transition-all",
              language === lang.code
                ? "border-pied-accent/40 bg-pied-accent/10 text-pied-text"
                : "border-pied-border bg-transparent text-pied-muted hover:border-white/[0.14] hover:bg-white/[0.03] hover:text-pied-text"
            )}
          >
            <span className="text-xl">{lang.flag}</span>
            <div className="flex-1">
              <p className="text-[13px] font-medium">{lang.label}</p>
              <p className="text-[11px] text-pied-muted">{lang.native}</p>
            </div>
            {language === lang.code && (
              <div className="flex size-4 items-center justify-center rounded-full bg-pied-accent">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-[11px] text-pied-muted">
        {t("settings.currentLanguage")}:{" "}
        <span className="font-semibold uppercase text-pied-text">{language}</span>
      </p>
    </div>
  );
}

// ─── Main SettingsModal ────────────────────────────────────────────────────────
export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [mobileView, setMobileView] = useState<"menu" | "detail">("menu");

  useEffect(() => {
    if (open) {
      setMobileView("menu");
    }
  }, [open]);

  const navItems: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: t("settings.profile"), icon: <User className="h-4 w-4" /> },
    { id: "account", label: t("settings.account"), icon: <CreditCard className="h-4 w-4" /> },
    { id: "voice", label: t("settings.voice"), icon: <Mic className="h-4 w-4" /> },
    { id: "storage", label: t("settings.storage"), icon: <HardDrive className="h-4 w-4" /> },
    { id: "chat", label: t("settings.chat"), icon: <MessageSquare className="h-4 w-4" /> },
    { id: "dataControl", label: t("settings.dataControl"), icon: <Shield className="h-4 w-4" /> },
    {
      id: "personalization",
      label: t("settings.personalization"),
      icon: <Palette className="h-4 w-4" />,
    },
    { id: "language", label: t("settings.language"), icon: <Globe className="h-4 w-4" /> },
  ];

  const renderPanel = () => {
    switch (activeTab) {
      case "profile":
        return <ProfilePanel />;
      case "account":
        return <AccountPanel />;
      case "voice":
        return <VoicePanel />;
      case "storage":
        return <StoragePanel />;
      case "chat":
        return <ChatPanel onClose={onClose} />;
      case "dataControl":
        return <DataControlPanel />;
      case "personalization":
        return <PersonalizationPanel />;
      case "language":
        return <LanguagePanel />;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="settings-modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-none fixed inset-0 z-[201] flex items-center justify-center p-3 sm:p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto flex h-[88vh] max-h-[640px] w-full max-w-[740px] overflow-hidden rounded-2xl border border-pied-border bg-pied-surface shadow-2xl sm:h-[560px] sm:rounded-pied"
            >
              {/* Left nav */}
              <div
                className={cn(
                  "flex h-full flex-col bg-pied-bg transition-all md:w-[210px] md:shrink-0 md:border-r md:border-pied-border",
                  mobileView === "detail" ? "hidden md:flex" : "w-full flex-1"
                )}
              >
                <div className="flex shrink-0 items-center justify-between border-b border-pied-border p-4 pb-3">
                  <h2 className="text-[14px] font-semibold text-pied-text">
                    {t("common.settings")}
                  </h2>
                  <button
                    onClick={onClose}
                    className="flex size-8 items-center justify-center rounded-pied text-pied-muted transition-colors hover:bg-white/[0.06] hover:text-pied-text md:hidden"
                    aria-label="Close settings"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto p-2">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileView("detail");
                      }}
                      className={cn(
                        "group flex w-full items-center gap-2.5 rounded-pied px-3 py-2.5 text-left text-[13px] font-medium transition-all",
                        activeTab === item.id
                          ? "bg-pied-surface-2 text-pied-text"
                          : "text-pied-muted hover:bg-white/[0.04] hover:text-pied-text"
                      )}
                    >
                      <span
                        className={cn(
                          "shrink-0 transition-colors",
                          activeTab === item.id ? "text-pied-accent" : ""
                        )}
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-pied-muted/50 group-hover:text-pied-muted" />
                    </button>
                  ))}
                </nav>
              </div>

              {/* Right content */}
              <div
                className={cn(
                  "flex h-full min-w-0 flex-1 flex-col",
                  mobileView === "menu" ? "hidden md:flex" : "w-full flex-1"
                )}
              >
                {/* Panel header */}
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-pied-border px-4 sm:px-5">
                  <div className="flex min-w-0 items-center gap-2">
                    <button
                      onClick={() => setMobileView("menu")}
                      className="-ml-1 flex shrink-0 items-center gap-1 rounded-pied px-2 py-1 text-xs font-medium text-pied-muted transition-colors hover:bg-white/[0.06] hover:text-pied-text md:hidden"
                      aria-label="Back to settings menu"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>{t("common.settings")}</span>
                    </button>
                    <span className="text-pied-muted/30 md:hidden">/</span>
                    <h3 className="truncate text-[14px] font-semibold text-pied-text sm:text-[15px]">
                      {navItems.find((n) => n.id === activeTab)?.label}
                    </h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex size-8 shrink-0 items-center justify-center rounded-pied text-pied-muted transition-colors hover:bg-white/[0.06] hover:text-pied-text"
                    aria-label="Close settings"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Panel body */}
                <div className="no-scrollbar flex-1 overflow-y-auto p-4 sm:p-5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      {renderPanel()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
