"use client";
import React, { useId, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  particleSize?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

export const SparklesCore = (props: ParticlesProps) => {
  const {
    id,
    className,
    background,
    minSize,
    maxSize,
    speed,
    particleColor,
    particleDensity,
  } = props;
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const generatedParticles = [];
    const count = particleDensity || 100;
    for (let i = 0; i < count; i++) {
      generatedParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * ((maxSize || 3) - (minSize || 1)) + (minSize || 1),
        duration: Math.random() * (speed || 5) + 2,
        delay: Math.random() * 5,
      });
    }
    setParticles(generatedParticles);
  }, [maxSize, minSize, particleDensity, speed]);

  return (
    <div
      id={id || "sparkles"}
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ background: background || "transparent" }}
    >
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            top: `${particle.y}%`,
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particleColor || "#FFF",
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
