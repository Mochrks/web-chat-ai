import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
    children: React.ReactNode;
    className?: string;
    options?: any;
    root?: boolean;
}

export const SmoothScroll = ({ children, className = "", options = {}, root = false }: SmoothScrollProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const lenisRef = useRef<Lenis | null>(null);

    const optionsJson = JSON.stringify(options);

    useEffect(() => {
        if (!root && !wrapperRef.current) return;

        const lenis = new Lenis({
            wrapper: root ? undefined : wrapperRef.current!,
            content: root ? undefined : (contentRef.current || undefined),
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.2,
            touchMultiplier: 2,
            ...options
        });

        lenisRef.current = lenis;

        const raf = (time: number) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };

        requestAnimationFrame(raf);

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
            gsap.ticker.remove(lenis.raf);
        };
    }, [root, optionsJson]);

    if (root) {
        return <>{children}</>;
    }

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
