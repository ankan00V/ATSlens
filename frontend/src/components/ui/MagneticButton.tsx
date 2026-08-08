'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  magnetDistance?: number;
  variant?: 'primary' | 'secondary' | 'glass';
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  magnetDistance = 35,
  variant = 'primary',
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springConfig = { stiffness: 180, damping: 14, mass: 0.1 };
  const x = useSpring(rawX, springConfig);
  const y = useSpring(rawY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // Magnetic pull effect (capped at magnetDistance)
    const pullX = Math.max(-magnetDistance, Math.min(magnetDistance, distanceX * 0.4));
    const pullY = Math.max(-magnetDistance, Math.min(magnetDistance, distanceY * 0.4));

    rawX.set(pullX);
    rawY.set(pullY);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  // Variant style maps (strict MAANG aesthetic: NO #000000, NO glowing purple)
  const baseVariantStyles = {
    primary:
      'bg-[#0f172a] hover:bg-[#1e293b] text-[#fafafa] border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
    secondary:
      'bg-white/80 hover:bg-white text-[#0f172a] border border-[#e5e7eb] shadow-sm',
    glass:
      'bg-white/15 hover:bg-white/25 text-white border border-white/40 backdrop-blur-md shadow-lg',
  };

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y } as any}
      whileTap={{ scale: 0.95 }}
      className={`relative inline-flex items-center justify-center font-sans font-medium rounded-full transition-colors duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${baseVariantStyles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default MagneticButton;
