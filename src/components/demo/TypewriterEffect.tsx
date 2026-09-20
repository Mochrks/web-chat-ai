import React, { useState, useEffect } from "react";
import type { TypewriterEffectProps } from "@/types/components";

export default function TypewriterEffect({ text, delay = 20, onComplete }: TypewriterEffectProps) {
    const [currentText, setCurrentText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setCurrentText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, delay);
            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [currentIndex, delay, text, onComplete]);

    return <span>{currentText}</span>;
}
