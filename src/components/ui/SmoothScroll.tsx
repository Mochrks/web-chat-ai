import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
    children: React.ReactNode;
    className?: string;
    options?: any;
}

export const SmoothScroll = ({ children, className = "", options = {} }: SmoothScrollProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        if (!wrapperRef.current) return;

        const lenis = new Lenis({
            wrapper: wrapperRef.current,
            content: contentRef.current || undefined, // If null, Lenis might infer
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            ...options
        });

        lenisRef.current = lenis;

        const raf = (time: number) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };

        requestAnimationFrame(raf);

        // Integrate with GSAP
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
            gsap.ticker.remove(lenis.raf);
        };
    }, []);

    // Expose lenis instance via a custom event or context if needed, 
    // but for now, we just want the smooth scroll effect.

    return (
        <div
            ref={wrapperRef}
            className={`overflow-y-auto h-full w-full ${className}`}
        >
            <div ref={contentRef}>
                {children}
            </div>
        </div>
    );
};
