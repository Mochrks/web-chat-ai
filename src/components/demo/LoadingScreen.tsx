import React from "react";
import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-pied-bg">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "linear",
          }}
          className="h-12 w-12 rounded-full border-2 border-pied-border border-t-pied-accent"
        />
      </div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-5 text-xs font-medium uppercase tracking-[0.15em] text-pied-muted"
      >
        Loading System
      </motion.p>
    </div>
  );
}
