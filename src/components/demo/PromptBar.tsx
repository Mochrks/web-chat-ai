"use client";

import React, {
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Attachment01Icon,
  Cancel01Icon,
  ChartLineData01Icon,
  File02Icon,
  Globe02Icon,
  HelpCircleIcon,
  Mic01Icon,
  PlusSignIcon,
  SparklesIcon,
  Tick02Icon,
  UserAccountIcon,
  SourceCodeIcon,
  SentIcon,
  TextIcon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PromptBarSource {
  key: string;
  name: string;
  description?: string;
  icon?: ReactNode | IconSvgElement;
  attach?: boolean;
  action?: "code-context" | "rules" | "web-search";
}

export interface PromptBarCommand {
  key: string;
  name: string;
  description?: string;
}

export interface PromptBarModel {
  key: string;
  name: string;
  tag?: string;
  category?: "llm" | "image" | "video" | "audio";
  categoryLabel?: string;
  icon?: ReactNode;
  description?: string;
}

export interface PromptBarSendDetail {
  attachments: string[];
  model?: PromptBarModel;
  effort?: string;
  role?: string;
  codeContext?: string;
  rules?: string;
}

export interface PromptBarProps {
  placeholder?: string;
  sources?: PromptBarSource[];
  commands?: PromptBarCommand[];
  models?: PromptBarModel[];
  defaultModel?: string;
  onModelChange?: (model: string) => void;
  roles?: string[];
  defaultRole?: string;
  onRoleChange?: (role: string) => void;
  efforts?: string[];
  defaultEffort?: string;
  onEffortChange?: (effort: string) => void;
  busy?: boolean;
  onSend?: (text: string, detail: PromptBarSendDetail) => void;
  onStop?: () => void;
  onAttach?: (sourceKey?: string) => string | string[] | void | Promise<string | string[] | void>;
  onDictate?: () => string | void | Promise<string | void>;
  onFileUpload?: () => void;
  rulesOpen?: boolean;
  onRulesOpenChange?: (open: boolean) => void;
  background?: string;
  color?: string;
  menuBackground?: string;
  sparkColor?: string;
  sparkBoost?: number;
  width?: number | string;
  radius?: number;
  maxRows?: number;
  morphDuration?: number;
  squash?: number;
  tilt?: number;
  pressScale?: number;
  className?: string;
}

type Row = {
  key: string;
  name: string;
  description?: string;
  tag?: string;
  icon?: ReactNode | IconSvgElement;
  attach?: boolean;
  action?: "code-context" | "rules" | "web-search";
  category?: "llm" | "image" | "video" | "audio";
  categoryLabel?: string;
};

type Token = { kind: "at" | "slash"; query: string; start: number };
type MenuKind = "at" | "slash" | "model" | "effort" | "role" | null;
type Latest = Pick<
  PromptBarProps,
  | "onSend"
  | "onStop"
  | "onAttach"
  | "onDictate"
  | "onEffortChange"
  | "onRoleChange"
  | "onModelChange"
  | "onFileUpload"
>;

type Spark = {
  x: number;
  y: number;
  r: number;
  vy: number;
  sway: number;
  phase: number;
  life: number;
  span: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ARROW_UP = [12, 4.5, 18.5, 11, 14.25, 11, 14.25, 19.5, 9.75, 19.5, 9.75, 11, 5.5, 11];
const SQUARE = [12, 6, 18, 6, 18, 12, 18, 18, 6, 18, 6, 12, 6, 6];
const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1];
const LINE = 22;
const EDGE = 11;

const DEFAULT_SOURCES: PromptBarSource[] = [
  {
    key: "files",
    name: "Photos & files",
    description: "Upload from this device",
    icon: Attachment01Icon,
    attach: true,
  },
  {
    key: "web",
    name: "Web search",
    description: "Search the web for live results",
    icon: Globe02Icon,
    action: "web-search",
  },
  {
    key: "code-context",
    name: "Code Context",
    description: "Import or paste code snippets",
    icon: SourceCodeIcon,
    action: "code-context",
  },
];

const DEFAULT_COMMANDS: PromptBarCommand[] = [
  { key: "summarize", name: "/summarize", description: "Digest the thread so far" },
  { key: "explain", name: "/explain", description: "A plain-language walkthrough" },
  { key: "draft", name: "/draft", description: "Write a first version" },
];

const DEFAULT_EFFORTS = ["Low", "Medium", "High", "Max"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const pathAt = (a: number[], b: number[], t: number) => {
  let d = "";
  for (let i = 0; i < a.length; i += 2)
    d += `${i ? "L" : "M"}${mix(a[i], b[i], t).toFixed(2)} ${mix(a[i + 1], b[i + 1], t).toFixed(2)}`;
  return `${d}Z`;
};

const parseToken = (draft: string): Token | null => {
  const m = /(^|\s)([@/])([\w-]*)$/.exec(draft);
  if (!m) return null;
  return {
    kind: m[2] === "@" ? "at" : "slash",
    query: m[3].toLowerCase(),
    start: m.index + m[1].length,
  };
};

const renderIcon = (icon: ReactNode | IconSvgElement | undefined, size: number) => {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  return <HugeiconsIcon icon={icon as IconSvgElement} size={size} strokeWidth={1.8} />;
};

// ─── SendGlyph ────────────────────────────────────────────────────────────────
function SendGlyph({
  busy,
  morphDuration,
  squash,
  tilt,
}: {
  busy: boolean;
  morphDuration: number;
  squash: number;
  tilt: number;
}) {
  const reduce = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dir = useRef(busy ? 1 : -1);
  const t = useMotionValue(busy ? 1 : 0);

  useEffect(() => {
    const target = busy ? 1 : 0;
    dir.current = busy ? 1 : -1;
    if (t.get() === target) return undefined;
    const c = animate(
      t,
      target,
      reduce ? { duration: 0 } : { duration: morphDuration / 1000, ease: EASE_IN_OUT }
    );
    return () => c.stop();
  }, [busy, morphDuration, reduce, t]);

  useMotionValueEvent(t, "change", (v) => {
    pathRef.current?.setAttribute("d", pathAt(ARROW_UP, SQUARE, v));
    const goo = reduce ? 0 : Math.sin(v * Math.PI);
    const sx = 1 - squash * goo;
    if (svgRef.current)
      svgRef.current.style.transform = goo
        ? `rotate(${dir.current * tilt * goo}deg) scale(${sx},${1 / sx})`
        : "";
  });

  return (
    <svg
      ref={svgRef}
      className="prompt-bar__glyph"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <path ref={pathRef} d={pathAt(ARROW_UP, SQUARE, t.get())} />
    </svg>
  );
}

// ─── PromptBar ────────────────────────────────────────────────────────────────
const PromptBar: React.FC<PromptBarProps> = ({
  placeholder = "Ask anything",
  sources = DEFAULT_SOURCES,
  commands = DEFAULT_COMMANDS,
  models = [],
  defaultModel = "",
  onModelChange,
  roles = [],
  defaultRole = "",
  onRoleChange,
  efforts = DEFAULT_EFFORTS,
  defaultEffort = "",
  onEffortChange,
  busy = false,
  onSend,
  onStop,
  onAttach,
  onDictate,
  onFileUpload,
  rulesOpen: controlledRulesOpen,
  onRulesOpenChange,
  background = "#0e0f17",
  color = "#f2f2f0",
  menuBackground = "#11131c",
  sparkColor = "#3b82f6",
  sparkBoost = 1,
  width = "100%",
  radius = 14,
  maxRows = 5,
  morphDuration = 240,
  squash = 0.12,
  tilt = 8,
  pressScale = 0.96,
  className = "",
}) => {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const sparkRef = useRef<HTMLCanvasElement>(null);
  const typing = useRef({ energy: 0, strokes: 0 });
  const boost = useRef(sparkBoost);
  boost.current = sparkBoost;
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastOpen = useRef<string | null>(null);
  const dictation = useRef(0);
  const latest = useRef<Latest>({});
  latest.current = {
    onSend,
    onStop,
    onAttach,
    onDictate,
    onEffortChange,
    onRoleChange,
    onModelChange,
    onFileUpload,
  };

  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [modelKey, setModelKey] = useState(defaultModel);
  const [currentRole, setCurrentRole] = useState(defaultRole || roles[0] || "");
  const [plusOpen, setPlusOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [effortOpen, setEffortOpen] = useState(false);
  const [effortIndex, setEffortIndex] = useState(() => {
    const i = efforts.indexOf(defaultEffort);
    return i >= 0 ? i : Math.max(0, Math.floor((efforts.length - 1) / 2));
  });
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(0);
  const [listening, setListening] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [codeContextOpen, setCodeContextOpen] = useState(false);
  const [codeContextValue, setCodeContextValue] = useState("");
  const [internalRulesOpen, setInternalRulesOpen] = useState(false);
  const rulesOpen = controlledRulesOpen !== undefined ? controlledRulesOpen : internalRulesOpen;
  const setRulesOpen = (v: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof v === "function" ? v(rulesOpen) : v;
    if (onRulesOpenChange) {
      onRulesOpenChange(next);
    }
    setInternalRulesOpen(next);
  };
  const [rulesValue, setRulesValue] = useState("");
  const [webSearchActive, setWebSearchActive] = useState(false);
  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const codeFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultModel) setModelKey(defaultModel);
  }, [defaultModel]);

  useEffect(() => {
    if (defaultRole) setCurrentRole(defaultRole);
  }, [defaultRole]);

  useEffect(() => {
    if (defaultEffort) {
      const idx = efforts.indexOf(defaultEffort);
      if (idx >= 0) setEffortIndex(idx);
    }
  }, [defaultEffort, efforts]);

  const model = models.find((m) => m.key === modelKey) ?? models[0];
  const token = dismissed ? null : parseToken(draft);

  // Compute which menu is open
  const open: MenuKind = plusOpen
    ? "at"
    : roleOpen
      ? "role"
      : token?.kind === "at"
        ? "at"
        : token?.kind === "slash"
          ? "slash"
          : modelOpen
            ? "model"
            : effortOpen
              ? "effort"
              : null;

  const query = plusOpen || roleOpen ? "" : (token?.query ?? "");

  const list = useMemo<Row[]>(() => {
    if (open === "at") return sources.filter((s) => s.name.toLowerCase().includes(query));
    if (open === "slash")
      return commands.filter((c) => c.name.replace(/^\//, "").toLowerCase().startsWith(query));
    if (open === "model") return models;
    if (open === "role") return roles.map((r) => ({ key: r, name: r }));
    return [];
  }, [open, query, sources, commands, models, roles]);

  const cursor = Math.min(active, Math.max(0, list.length - 1));
  const canSend = draft.trim().length > 0 || attachments.length > 0;
  const armed = busy || canSend;
  const level = efforts[effortIndex] ?? "";
  const maxed = efforts.length > 1 && effortIndex === efforts.length - 1;

  const focusInput = () => inputRef.current?.focus({ preventScroll: true });

  const closeMenus = useCallback(() => {
    setPlusOpen(false);
    setModelOpen(false);
    setRoleOpen(false);
    setEffortOpen(false);
  }, []);

  // Glow tracker
  useLayoutEffect(() => {
    const glow = glowRef.current;
    if (!glow || !open || open === "effort") return;
    const row = rowRefs.current[cursor];
    if (!row) {
      glow.style.opacity = "0";
      return;
    }
    const fresh = lastOpen.current !== open;
    lastOpen.current = open;
    if (fresh) glow.style.transition = "none";
    glow.style.top = `${row.offsetTop}px`;
    glow.style.height = `${row.offsetHeight}px`;
    glow.style.opacity = "1";
    if (fresh) {
      void glow.offsetHeight;
      glow.style.transition = "";
    }
  }, [open, cursor, list]);

  useEffect(() => {
    if (!open) lastOpen.current = null;
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!plusOpen && !modelOpen && !effortOpen && !roleOpen) return undefined;
    const onDown = (e: globalThis.PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeMenus();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [plusOpen, modelOpen, effortOpen, roleOpen, closeMenus]);

  // Auto-resize textarea
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "0px";
    const max = LINE * maxRows;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [draft, maxRows]);

  useEffect(
    () => () => {
      dictation.current += 1;
    },
    []
  );

  // Spark canvas
  useEffect(() => {
    const canvas = sparkRef.current;
    if (!maxed || reduce || !canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    typing.current.strokes = 0;
    let raf = 0,
      last = performance.now(),
      w = 0,
      h = 0,
      due = 0,
      speed = 1,
      pulse = 0;
    const parts: Spark[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (burst: boolean) =>
      parts.push({
        x: Math.random() * w,
        y: burst ? h * (0.2 + Math.random() * 0.8) : h + 3,
        r: 0.9 + Math.random() * 1.1,
        vy: -(7 + Math.random() * 9),
        sway: (Math.random() - 0.5) * 10,
        phase: Math.random() * Math.PI * 2,
        life: burst ? Math.random() * 1.2 : 0,
        span: 2.4 + Math.random() * 2.4,
      });
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const typed = typing.current;
      const gain = boost.current;
      typed.energy *= Math.exp(-dt / 0.8);
      pulse *= Math.exp(-dt / 0.16);
      if (typed.strokes > 0) {
        typed.strokes = 0;
        if (gain > 0) pulse = 1;
      }
      const energy = typed.energy * gain;
      speed += (1 + energy * 6 - speed) * (1 - Math.exp(-dt / 0.15));
      due += dt;
      while (due > 0.14) {
        due -= 0.14;
        if (parts.length < 30) spawn(false);
      }
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = sparkColor;
      ctx.shadowColor = sparkColor;
      ctx.shadowBlur = 6 + energy * 10 + pulse * 6;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt;
        if (p.life > p.span) {
          parts.splice(i, 1);
          continue;
        }
        const k = p.life / p.span;
        const twinkle = 0.7 + 0.3 * Math.sin((now / 160) * (1 + energy) + p.phase);
        p.y += p.vy * dt * speed;
        if (p.y < -4) {
          p.y = h + 3;
          p.x = Math.random() * w;
        }
        const edge = Math.min(1, Math.max(0, p.y / 14), Math.max(0, (h - p.y) / 14));
        ctx.globalAlpha =
          Math.min(1, Math.sin(k * Math.PI) * (0.9 + energy * 0.25) * twinkle) * edge;
        ctx.beginPath();
        ctx.arc(
          p.x + Math.sin((now / 900) * (1 + energy * 0.8) + p.phase) * p.sway,
          p.y,
          p.r * twinkle * (1 + energy * 0.35),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    resize();
    for (let i = 0; i < 26; i++) spawn(true);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      ctx.clearRect(0, 0, w, h);
    };
  }, [maxed, reduce, sparkColor]);

  // ── Effort ────────────────────────────────────────────────────────────────
  const setEffort = (i: number) => {
    const next = Math.max(0, Math.min(efforts.length - 1, i));
    if (next === effortIndex) return;
    setEffortIndex(next);
    latest.current.onEffortChange?.(efforts[next]);
  };
  const effortFromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const k = (e.clientX - rect.left - EDGE) / Math.max(1, rect.width - 2 * EDGE);
    setEffort(Math.round(k * (efforts.length - 1)));
  };
  const onEffortKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step =
      e.key === "ArrowRight" || e.key === "ArrowUp"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowDown"
          ? -1
          : 0;
    if (step) {
      e.preventDefault();
      setEffort(effortIndex + step);
    } else if (e.key === "Home") {
      e.preventDefault();
      setEffort(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setEffort(efforts.length - 1);
    } else if (e.key === "Escape") {
      setEffortOpen(false);
      focusInput();
    }
  };
  const stepAt = (i: number) =>
    `calc(${EDGE}px + (100% - ${EDGE * 2}px) * ${i / Math.max(1, efforts.length - 1)})`;
  const fillAt = (i: number) => (i === efforts.length - 1 ? "100%" : `calc(${stepAt(i)} + 7px)`);

  // ── Pick ──────────────────────────────────────────────────────────────────
  const pick = (row: Row) => {
    // Role pick
    if (open === "role") {
      setCurrentRole(row.key);
      latest.current.onRoleChange?.(row.key);
      setRoleOpen(false);
      focusInput();
      return;
    }
    // Model pick
    if (open === "model") {
      setModelKey(row.key);
      latest.current.onModelChange?.(row.key);
      setModelOpen(false);
      focusInput();
      return;
    }
    // Action-based sources
    if (row.action === "code-context") {
      setPlusOpen(false);
      setCodeContextOpen(true);
      setTimeout(() => codeTextareaRef.current?.focus(), 100);
      return;
    }
    if (row.action === "rules") {
      setPlusOpen(false);
      setRulesOpen(true);
      return;
    }
    if (row.action === "web-search") {
      setPlusOpen(false);
      setWebSearchActive((v) => !v);
      focusInput();
      return;
    }
    const head = token ? draft.slice(0, token.start) : draft;
    if (row.attach) {
      setDraft(head);
      Promise.resolve(latest.current.onAttach?.(row.key)).then((files) => {
        if (!files) return;
        setAttachments((a) => [...a, ...(Array.isArray(files) ? files : [files])]);
      });
    } else if (open === "at") {
      setDraft(`${head}@${row.name}`);
    } else {
      setDraft(`${head}${row.name}`);
    }
    setPlusOpen(false);
    setDismissed(false);
    focusInput();
  };

  // ── Code Context helpers ──────────────────────────────────────────────────
  const handleCodeImport = () => {
    codeFileInputRef.current?.click();
  };
  const handleCodeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCodeContextValue((prev) => (prev ? `${prev}\n\n${text}` : text));
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  const applyCodeContext = () => {
    setCodeContextOpen(false);
    focusInput();
  };
  const clearCodeContext = () => {
    setCodeContextValue("");
    setCodeContextOpen(false);
    focusInput();
  };
  const applyRules = () => {
    setRulesOpen(false);
    focusInput();
  };
  const clearRules = () => {
    setRulesValue("");
    setRulesOpen(false);
    focusInput();
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const send = () => {
    if (!canSend || busy) return;
    latest.current.onSend?.(draft.trim(), {
      attachments,
      model,
      effort: level,
      role: currentRole,
      codeContext: codeContextValue || undefined,
      rules: rulesValue || undefined,
    });
    setDraft("");
    setAttachments([]);
    setDismissed(false);
    closeMenus();
    focusInput();
  };

  // ── Dictate ───────────────────────────────────────────────────────────────
  const toggleListen = () => {
    if (listening) {
      dictation.current += 1;
      setListening(false);
      return;
    }
    const seq = ++dictation.current;
    setListening(true);
    Promise.resolve(latest.current.onDictate?.()).then(
      (text) => {
        if (seq !== dictation.current) return;
        setListening(false);
        if (text) setDraft((d) => (d.trim() ? `${d.trimEnd()} ${text}` : text));
        focusInput();
      },
      () => {
        if (seq === dictation.current) setListening(false);
      }
    );
  };

  // ── Keys ──────────────────────────────────────────────────────────────────
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (open && list.length && open !== "effort") {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setActive((cursor + (e.key === "ArrowDown" ? 1 : list.length - 1)) % list.length);
        return;
      }
      if ((e.key === "Enter" && !e.shiftKey) || e.key === "Tab") {
        e.preventDefault();
        pick(list[cursor]);
        return;
      }
    }
    if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setDismissed(true);
        closeMenus();
      }
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const down = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 || !armed) return;
    setPressed(true);
  };
  const up = () => setPressed(false);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={rootRef}
      className={`prompt-bar${className ? ` ${className}` : ""}`}
      data-busy={busy ? "" : undefined}
      data-max={maxed ? "" : undefined}
      style={
        {
          "--pb-bg": background,
          "--pb-ink": color,
          "--pb-menu": menuBackground,
          "--pb-w": typeof width === "number" ? `${width}px` : width,
          "--pb-radius": `${radius}px`,
          "--pb-spark": sparkColor,
          "--pb-press": pressScale,
        } as CSSProperties
      }
    >
      {/* Hidden file input for code context import */}
      <input
        ref={codeFileInputRef}
        type="file"
        accept=".js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.cs,.go,.rs,.rb,.php,.html,.css,.json,.xml,.yaml,.yml,.md,.txt,.sql,.sh,.bat,.ps1"
        className="prompt-bar__hidden-input"
        onChange={handleCodeFileChange}
        aria-hidden="true"
      />
      {/* ── Popup menus ── */}
      {open ? (
        <div
          className="prompt-bar__menu"
          role={open === "effort" ? "dialog" : "listbox"}
          aria-label={
            open === "at"
              ? "Sources"
              : open === "slash"
                ? "Commands"
                : open === "model"
                  ? "Models"
                  : open === "role"
                    ? "Role"
                    : "Effort"
          }
          data-kind={open}
        >
          {open === "effort" ? (
            <>
              <div className="prompt-bar__effort-head">
                <span className="prompt-bar__effort-title">Max Limit</span>
                <span className="prompt-bar__effort-level">{level}</span>
                <span
                  className="prompt-bar__effort-help"
                  title="Higher limit allows longer and deeper answers"
                >
                  <HugeiconsIcon icon={HelpCircleIcon} size={14} strokeWidth={1.8} />
                </span>
              </div>
              <div className="prompt-bar__effort-ends">
                <span>Faster</span>
                <span>Smarter</span>
              </div>
              <div
                className="prompt-bar__effort-track"
                role="slider"
                tabIndex={0}
                aria-label="Max Limit"
                aria-valuemin={0}
                aria-valuemax={efforts.length - 1}
                aria-valuenow={effortIndex}
                aria-valuetext={level}
                style={
                  {
                    "--pb-effort-x": stepAt(effortIndex),
                    "--pb-effort-fill": fillAt(effortIndex),
                  } as CSSProperties
                }
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {}
                  e.currentTarget.focus({ preventScroll: true });
                  effortFromPointer(e);
                }}
                onPointerMove={(e) => {
                  if (e.buttons & 1) effortFromPointer(e);
                }}
                onKeyDown={onEffortKey}
              >
                <span className="prompt-bar__effort-fill" />
                {efforts.map((lbl, i) => (
                  <i key={lbl} className="prompt-bar__effort-dot" style={{ left: stepAt(i) }} />
                ))}
                <span className="prompt-bar__effort-thumb" />
              </div>
            </>
          ) : (
            <>
              <span ref={glowRef} className="prompt-bar__glow" aria-hidden="true" />
              {list.map((row, i) => (
                <button
                  key={row.key}
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={i === cursor}
                  className="prompt-bar__row"
                  onMouseDown={(e) => e.preventDefault()}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => pick(row)}
                >
                  {/* Sources (+) menu */}
                  {open === "at" && (
                    <>
                      <span className="prompt-bar__row-icon">{renderIcon(row.icon, 16)}</span>
                      <span className="prompt-bar__row-name">{row.name}</span>
                      {row.description ? (
                        <span className="prompt-bar__row-desc">{row.description}</span>
                      ) : null}
                    </>
                  )}
                  {/* Commands (/) menu */}
                  {open === "slash" && (
                    <>
                      <span className="prompt-bar__row-name">{row.name}</span>
                      {row.description ? (
                        <span className="prompt-bar__row-desc">{row.description}</span>
                      ) : null}
                    </>
                  )}
                  {/* Role menu */}
                  {open === "role" && (
                    <>
                      <span className="prompt-bar__row-icon">
                        <HugeiconsIcon icon={UserAccountIcon} size={16} strokeWidth={1.8} />
                      </span>
                      <span className="prompt-bar__row-name">{row.name}</span>
                      <span
                        className="prompt-bar__row-check"
                        data-on={row.key === currentRole ? "" : undefined}
                        style={{ marginLeft: "auto" }}
                      >
                        <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2.5} />
                      </span>
                    </>
                  )}
                  {/* Model menu */}
                  {open === "model" && (
                    <>
                      {row.icon && (
                        <span
                          className="prompt-bar__row-icon"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            width: 22,
                            marginRight: 6,
                          }}
                        >
                          {renderIcon(row.icon, 16)}
                        </span>
                      )}
                      <span
                        className="prompt-bar__row-name"
                        style={{
                          flex: "1 1 auto",
                          minWidth: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {row.name}
                      </span>
                      {row.categoryLabel && (
                        <span
                          style={{
                            flexShrink: 0,
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            padding: "2px 7px",
                            borderRadius: "4px",
                            background:
                              row.category === "image"
                                ? "rgba(16, 185, 129, 0.15)"
                                : row.category === "video"
                                  ? "rgba(245, 158, 11, 0.15)"
                                  : row.category === "audio"
                                    ? "rgba(236, 72, 153, 0.15)"
                                    : "rgba(99, 102, 241, 0.15)",
                            color:
                              row.category === "image"
                                ? "#10B981"
                                : row.category === "video"
                                  ? "#F59E0B"
                                  : row.category === "audio"
                                    ? "#EC4899"
                                    : "#818cf8",
                            marginLeft: 8,
                          }}
                        >
                          {row.categoryLabel}
                        </span>
                      )}
                      {row.tag ? (
                        <span
                          className="prompt-bar__row-tag"
                          style={{
                            flexShrink: 0,
                            marginLeft: "auto",
                          }}
                        >
                          {row.tag}
                        </span>
                      ) : null}
                      <span
                        className="prompt-bar__row-check"
                        data-on={row.key === model?.key ? "" : undefined}
                        style={{
                          flexShrink: 0,
                          width: 18,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginLeft: row.tag ? 8 : "auto",
                        }}
                      >
                        <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2.5} />
                      </span>
                    </>
                  )}
                </button>
              ))}
              {list.length === 0 && (
                <div className="prompt-bar__empty">No matches for &ldquo;{query}&rdquo;</div>
              )}
            </>
          )}
        </div>
      ) : null}

      {/* ── Code Context Panel ── */}
      {codeContextOpen && (
        <div className="prompt-bar__panel" data-kind="code">
          <div className="prompt-bar__panel-header">
            <span className="prompt-bar__panel-icon">
              <HugeiconsIcon icon={SourceCodeIcon} size={16} strokeWidth={1.8} />
            </span>
            <span className="prompt-bar__panel-title">Code Context</span>
            <div className="prompt-bar__panel-actions">
              <button type="button" className="prompt-bar__panel-btn" onClick={handleCodeImport}>
                <HugeiconsIcon icon={Upload04Icon} size={13} strokeWidth={2} />
                <span>Import</span>
              </button>
              {codeContextValue && (
                <button
                  type="button"
                  className="prompt-bar__panel-btn prompt-bar__panel-btn--danger"
                  onClick={clearCodeContext}
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={13} strokeWidth={2} />
                  <span>Clear</span>
                </button>
              )}
              <button
                type="button"
                className="prompt-bar__panel-btn prompt-bar__panel-btn--primary"
                onClick={applyCodeContext}
              >
                <HugeiconsIcon icon={Tick02Icon} size={13} strokeWidth={2.5} />
                <span>Apply</span>
              </button>
            </div>
          </div>
          <div className="prompt-bar__code-editor">
            <div className="prompt-bar__code-lines" aria-hidden="true">
              {(codeContextValue || "").split("\n").map((_, i) => (
                <span key={i} className="prompt-bar__code-ln">
                  {i + 1}
                </span>
              ))}
            </div>
            <textarea
              ref={codeTextareaRef}
              className="prompt-bar__code-input"
              value={codeContextValue}
              onChange={(e) => setCodeContextValue(e.target.value)}
              placeholder="Paste or import your code here..."
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>
      )}

      {/* ── Rules Panel ── */}
      {rulesOpen && (
        <div className="prompt-bar__panel" data-kind="rules">
          <div className="prompt-bar__panel-header">
            <span className="prompt-bar__panel-icon">
              <HugeiconsIcon icon={TextIcon} size={16} strokeWidth={1.8} />
            </span>
            <span className="prompt-bar__panel-title">Rules</span>
            <div className="prompt-bar__panel-actions">
              {rulesValue && (
                <button
                  type="button"
                  className="prompt-bar__panel-btn prompt-bar__panel-btn--danger"
                  onClick={clearRules}
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={13} strokeWidth={2} />
                  <span>Clear</span>
                </button>
              )}
              <button
                type="button"
                className="prompt-bar__panel-btn prompt-bar__panel-btn--primary"
                onClick={applyRules}
              >
                <HugeiconsIcon icon={Tick02Icon} size={13} strokeWidth={2.5} />
                <span>Apply</span>
              </button>
            </div>
          </div>
          <textarea
            className="prompt-bar__rules-input"
            value={rulesValue}
            onChange={(e) => setRulesValue(e.target.value)}
            placeholder={`Enter custom rules or instructions...\n\nExample:\n- Always respond in Bahasa Indonesia\n- Use TypeScript best practices\n- Include error handling`}
            spellCheck={false}
          />
        </div>
      )}

      {/* ── Field ── */}
      <div
        className="prompt-bar__field"
        role="presentation"
        data-max={maxed ? "" : undefined}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget || e.target === inputRef.current) closeMenus();
        }}
        onClick={focusInput}
      >
        <canvas ref={sparkRef} className="prompt-bar__sparks" aria-hidden="true" />

        {attachments.length > 0 && (
          <div className="prompt-bar__chips">
            {attachments.map((file, i) => (
              <span key={`${file}-${i}`} className="prompt-bar__chip">
                <HugeiconsIcon icon={File02Icon} size={12} strokeWidth={2} />
                <span className="prompt-bar__chip-name">{file}</span>
                <button
                  type="button"
                  className="prompt-bar__chip-x"
                  aria-label={`Remove ${file}`}
                  onClick={() => setAttachments((a) => a.filter((_, j) => j !== i))}
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={10} strokeWidth={2.5} />
                </button>
              </span>
            ))}
          </div>
        )}

        <textarea
          ref={inputRef}
          className="prompt-bar__input"
          rows={1}
          value={draft}
          placeholder={listening ? "Listening…" : placeholder}
          aria-label="Prompt"
          onChange={(e) => {
            setDraft(e.target.value);
            typing.current.energy = Math.min(1.6, typing.current.energy + 0.22);
            typing.current.strokes = Math.min(4, typing.current.strokes + 1);
            setDismissed(false);
            closeMenus();
            setActive(0);
          }}
          onFocus={closeMenus}
          onKeyDown={onKeyDown}
        />

        <div className="prompt-bar__bar">
          <div className="prompt-bar__bar-left">
            {/* + sources button */}
            <button
              type="button"
              className="prompt-bar__tool"
              aria-label="Add files and sources"
              aria-expanded={plusOpen}
              data-on={plusOpen ? "" : undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setModelOpen(false);
                setRoleOpen(false);
                setEffortOpen(false);
                setCodeContextOpen(false);
                setRulesOpen(false);
                setActive(0);
                setPlusOpen((v) => !v);
                focusInput();
              }}
            >
              <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2} />
            </button>

            {/* File upload button with tooltip */}
            <div className="prompt-bar__tool-wrap group/upload relative inline-flex items-center">
              <button
                type="button"
                className="prompt-bar__tool"
                aria-label="Upload source code"
                title="Upload source code"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  closeMenus();
                  if (latest.current.onFileUpload) {
                    latest.current.onFileUpload();
                  } else {
                    latest.current.onAttach?.("files");
                  }
                }}
              >
                <HugeiconsIcon icon={Upload04Icon} size={15} strokeWidth={2} />
              </button>
              <div
                className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-[100] -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#1e1f24] px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-2xl transition-all duration-150 group-hover/upload:-translate-y-0.5 group-hover/upload:opacity-100"
                role="tooltip"
              >
                Upload source code
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e1f24]" />
              </div>
            </div>

            {/* @Web search toggle with tooltip */}
            <div className="prompt-bar__tool-wrap group/web relative inline-flex items-center">
              <button
                type="button"
                className="prompt-bar__pick prompt-bar__pick--web"
                aria-label="Toggle web search"
                title="Toggle web search"
                data-on={webSearchActive ? "" : undefined}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setWebSearchActive((v) => !v)}
              >
                <HugeiconsIcon icon={Globe02Icon} size={13} strokeWidth={2} />
                <span className="prompt-bar__pick-label">Web</span>
              </button>
              <div
                className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-[100] -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#1e1f24] px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-2xl transition-all duration-150 group-hover/web:-translate-y-0.5 group-hover/web:opacity-100"
                role="tooltip"
              >
                {webSearchActive ? "Web search enabled" : "Search the web"}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e1f24]" />
              </div>
            </div>

            {/* Rules button in PromptBar with tooltip */}
            <div
              className={`prompt-bar__tool-wrap group/rules relative items-center ${rulesValue ? "inline-flex" : "hidden sm:inline-flex"}`}
            >
              <button
                type="button"
                className="prompt-bar__pick prompt-bar__pick--rules"
                aria-label="Custom rules"
                title="Prompt Rules & Instructions"
                data-on={rulesValue || rulesOpen ? "" : undefined}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  closeMenus();
                  setRulesOpen((v) => !v);
                }}
              >
                <HugeiconsIcon icon={TextIcon} size={13} strokeWidth={2} />
                <span className="prompt-bar__pick-label">{rulesValue ? "Rules •" : "Rules"}</span>
              </button>
              <div
                className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-[100] -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#1e1f24] px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-2xl transition-all duration-150 group-hover/rules:-translate-y-0.5 group-hover/rules:opacity-100"
                role="tooltip"
              >
                {rulesValue ? "Rules (Active) — click to edit" : "Set custom rules"}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e1f24]" />
              </div>
            </div>

            {/* Active indicator for code */}
            {codeContextValue && (
              <button
                type="button"
                className="prompt-bar__pick prompt-bar__pick--code"
                aria-label="Code context active"
                data-on=""
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  closeMenus();
                  setCodeContextOpen(true);
                }}
              >
                <HugeiconsIcon icon={SourceCodeIcon} size={13} strokeWidth={2} />
                <span className="prompt-bar__pick-label">Code</span>
              </button>
            )}

            {/* Model picker */}
            {models.length > 0 && (
              <button
                type="button"
                className="prompt-bar__pick"
                aria-label="Choose model"
                aria-expanded={modelOpen}
                data-on={modelOpen ? "" : undefined}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setPlusOpen(false);
                  setRoleOpen(false);
                  setEffortOpen(false);
                  setActive(Math.max(0, models.indexOf(model!)));
                  setModelOpen((v) => !v);
                  focusInput();
                }}
              >
                {model?.icon && <span className="prompt-bar__pick-icon">{model.icon}</span>}
                <span className="prompt-bar__pick-label">{model?.name}</span>
                <span className="prompt-bar__pick-chevron">
                  <HugeiconsIcon icon={ArrowDown01Icon} size={12} strokeWidth={2.4} />
                </span>
              </button>
            )}

            {/* Role picker */}
            {roles.length > 0 && (
              <button
                type="button"
                className="prompt-bar__pick"
                aria-label="Choose role"
                aria-expanded={roleOpen}
                data-on={roleOpen ? "" : undefined}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setPlusOpen(false);
                  setModelOpen(false);
                  setEffortOpen(false);
                  setActive(Math.max(0, roles.indexOf(currentRole)));
                  setRoleOpen((v) => !v);
                  focusInput();
                }}
              >
                <HugeiconsIcon icon={UserAccountIcon} size={13} strokeWidth={2} />
                <span className="prompt-bar__pick-label">{currentRole || "Role"}</span>
                <span className="prompt-bar__pick-chevron">
                  <HugeiconsIcon icon={ArrowDown01Icon} size={12} strokeWidth={2.4} />
                </span>
              </button>
            )}

            {/* Effort picker */}
            {efforts.length > 0 && (
              <button
                type="button"
                className="prompt-bar__pick"
                aria-label="Choose effort"
                aria-expanded={effortOpen}
                data-on={effortOpen ? "" : undefined}
                data-max={maxed ? "" : undefined}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setPlusOpen(false);
                  setModelOpen(false);
                  setRoleOpen(false);
                  setEffortOpen((v) => !v);
                  focusInput();
                }}
              >
                <HugeiconsIcon icon={SparklesIcon} size={13} strokeWidth={2} />
                <span className="prompt-bar__pick-label">{level}</span>
              </button>
            )}
          </div>

          <div className="prompt-bar__bar-right">
            {/* Dictate */}
            {onDictate && (
              <button
                type="button"
                className="prompt-bar__tool"
                aria-label={listening ? "Stop dictation" : "Dictate"}
                aria-pressed={listening}
                data-on={listening ? "" : undefined}
                onMouseDown={(e) => e.preventDefault()}
                onClick={toggleListen}
              >
                {listening ? (
                  <span className="prompt-bar__eq" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  <HugeiconsIcon icon={Mic01Icon} size={15} strokeWidth={2} />
                )}
              </button>
            )}

            {/* Send / Stop */}
            <button
              type="button"
              className="prompt-bar__send"
              disabled={!armed}
              aria-label={busy ? "Stop" : "Send"}
              data-armed={armed ? "" : undefined}
              data-pressed={pressed ? "" : undefined}
              onMouseDown={(e) => e.preventDefault()}
              onPointerDown={down}
              onPointerUp={up}
              onPointerCancel={up}
              onPointerLeave={up}
              onClick={() => {
                if (busy) latest.current.onStop?.();
                else send();
              }}
            >
              <SendGlyph busy={busy} morphDuration={morphDuration} squash={squash} tilt={tilt} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptBar;
