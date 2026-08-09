import React from 'react';

interface LiquidGlassContainerProps {
  children: React.ReactNode;
  className?: string;
  glassOpacity?: number;
}

export const LiquidGlassContainer: React.FC<LiquidGlassContainerProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`relative rounded-3xl backdrop-blur-xl bg-slate-900/60 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};
