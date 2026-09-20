import { useState, useEffect } from "react";
import { GREETING_INTERVAL_MS } from "@/constants/app";

export function useGreeting(greetings: string[]) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % greetings.length);
        }, GREETING_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [greetings.length]);

    return greetings[currentIndex];
}
