import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-50 bg-pied-bg flex flex-col items-center justify-center">
            <div className="relative">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "linear"
                    }}
                    className="w-12 h-12 rounded-full border-2 border-pied-border border-t-pied-accent"
                />
            </div>
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-5 text-pied-muted font-medium tracking-[0.15em] text-xs uppercase"
            >
                Loading System
            </motion.p>
        </div>
    );
}
