import React from 'react';

interface PerpetualFloatProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  yOffset?: number;
  delay?: number;
}

export const PerpetualFloat: React.FC<PerpetualFloatProps> = ({ children, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
};
