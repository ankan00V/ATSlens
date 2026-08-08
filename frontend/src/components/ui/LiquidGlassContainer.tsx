'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export interface LiquidGlassContainerProps {
  children: React.ReactNode;
  className?: string;
  glassOpacity?: number; // Opacity modifier for backdrop, default: 0.12
  interactive?: boolean; // Enable spring hover dynamics, default: true
}

export const LiquidGlassContainer: React.FC<LiquidGlassContainerProps> = ({
  children,
  className = '',
  glassOpacity = 0.12,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reflectionPos, setReflectionPos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setReflectionPos({ x, y, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setReflectionPos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={interactive ? { scale: 1.008, y: -3 } : undefined}
      whileTap={interactive ? { scale: 0.995 } : undefined}
      transition={{ type: 'spring', stiffness: 350, damping: 25, mass: 0.8 }}
      className={`relative overflow-hidden rounded-[32px] border border-white/30 backdrop-blur-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] transform-gpu transition-colors duration-300 ${className}`}
      style={{
        backgroundColor: `rgba(255, 255, 255, ${glassOpacity})`,
      }}
    >
      {/* Dynamic Specular Glass Reflection Layer */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out z-[1]"
        style={{
          opacity: reflectionPos.opacity,
          background: `radial-gradient(600px circle at ${reflectionPos.x}% ${reflectionPos.y}%, rgba(255, 255, 255, 0.18), transparent 60%)`,
        }}
      />

      {/* Subtle Top Specular Edge Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent z-[2]" />

      {/* Content Container */}
      <div className="relative z-[3]">{children}</div>
    </motion.div>
  );
};

export default LiquidGlassContainer;
