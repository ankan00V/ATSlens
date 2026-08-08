'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface PerpetualFloatProps {
  children: React.ReactNode;
  className?: string;
  yOffset?: number;
  duration?: number;
  delay?: number;
}

export const PerpetualFloat: React.FC<PerpetualFloatProps> = ({
  children,
  className = '',
  yOffset = 8,
  duration = 4,
  delay = 0,
}) => {
  return (
    <motion.div
      animate={{
        y: [-yOffset, yOffset, -yOffset],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
        delay,
      }}
      className={`transform-gpu ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PerpetualFloat;
