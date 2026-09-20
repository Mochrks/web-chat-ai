import type { ReactNode } from "react";

export interface SidebarProps {
    collapsed?: boolean;
    toggleCollapse?: () => void;
}

export interface SidebarTooltipProps {
    children: ReactNode;
    text: string;
    collapsed: boolean;
    className?: string;
}

export interface MessageListProps {
    messages: import("./chat").Message[];
    userImage?: string | null;
}

export interface TypewriterEffectProps {
    text: string;
    delay?: number;
    onComplete?: () => void;
}

export interface FormattedMessageProps {
    content: string;
}

export interface ShaderParams {
    patternScale: number;
    refraction: number;
    edge: number;
    patternBlur: number;
    liquid: number;
    speed: number;
}
