# Handoff Report: M1 & M2 Exploration and Technical Specifications

## 1. Observation

### Current Environment & Dependencies
- **Target Directory**: `/Users/ankanghosh/Downloads/ats app/frontend`
- **File**: `frontend/package.json` (lines 12–18):
  ```json
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^1.30.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "tailwind-merge": "^3.6.0"
  }
  ```
- **React Version**: `^19.2.8` (React 19 ecosystem).
- **Styling Config**: `frontend/tailwind.config.js` defines Geist as primary sans font and custom colors (`wandor.dark: '#0a0a0a'`, `wandor.text: '#1a1a1a'`, `wandor.muted: '#767676'`).
- **Missing Directories/Files**: `src/components/ui/` directory does not yet exist.
- **Contract Reference**: `PROJECT.md` (lines 26–37) defines the interface contracts for isolated components `LiquidGlassContainer`, `MagneticButton`, and `PerpetualFloat`.

---

## 2. Logic Chain

### M1: Framer Motion Installation Blueprint
1. **Observation**: `react` is version `19.2.8`. Legacy `framer-motion` v10/v11 can trigger peer dependency warnings or type mismatches with React 19 types.
2. **Deduction**: `framer-motion` version `^12.4.7` (or latest v12) has native React 19 support and full compatibility with `useMotionValue`, `useSpring`, and `useTransform`.
3. **Execution Plan for M1**:
   - Run command in `/Users/ankanghosh/Downloads/ats app/frontend`:
     ```bash
     npm install framer-motion@^12.4.7
     ```
   - Verify addition in `package.json` under `"dependencies"`.

---

### M2: Isolated Client Components Specifications

#### Design Principles & MAANG Aesthetic Rules
- **Directives**: Every component in `src/components/ui/` MUST start with `'use client';` at line 1.
- **Color Palette Constraints**:
  - **Forbidden**: `#000000` (pure black), Inter font, glowing purple borders (`#a855f7`, `#8b5cf6`, `rgba(168,85,247,...)`).
  - **Required**: High-end dark slate / obsidian background tones (e.g., `#0a0a0a`, `#121316`, `#18181b`, `#1e2028`), crisp white specular border overlays (`border-white/20`, `hover:border-white/40`), translucent white/dark glass (`bg-white/10`, `bg-[#121316]/70`), and Geist typography.

---

### Component Specifications & Exact Code Guidance

#### 1. `LiquidGlassContainer.tsx`
- **Location**: `src/components/ui/LiquidGlassContainer.tsx`
- **Purpose**: High-intensity liquid glass panel with backdrop blur, specular border highlights, dynamic glass reflection physics tracking mouse movement, and `framer-motion` spring hover physics.
- **Prop Interface**:
  ```typescript
  export interface LiquidGlassContainerProps {
    children: React.ReactNode;
    className?: string;
    glassOpacity?: number; // Opacity modifier for backdrop, default: 0.12
    interactive?: boolean; // Enable spring hover dynamics, default: true
  }
  ```
- **Implementation Design**:
  ```tsx
  'use client';

  import React, { useRef, useState } from 'react';
  import { motion } from 'framer-motion';

  export interface LiquidGlassContainerProps {
    children: React.ReactNode;
    className?: string;
    glassOpacity?: number;
    interactive?: boolean;
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
  ```

---

#### 2. `MagneticButton.tsx`
- **Location**: `src/components/ui/MagneticButton.tsx`
- **Purpose**: Interactive button with magnetic cursor attraction physics using Framer Motion `useMotionValue` & `useSpring`.
- **Prop Interface**:
  ```typescript
  export interface MagneticButtonProps {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    magnetDistance?: number; // Attraction distance/pull strength in px, default: 35
    variant?: 'primary' | 'secondary' | 'glass';
  }
  ```
- **Implementation Design**:
  ```tsx
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
        'bg-[#121318] hover:bg-[#1c1e26] text-[#fafafa] border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
      secondary:
        'bg-white/80 hover:bg-white text-[#121318] border border-[#e5e7eb] shadow-sm',
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
        style={{ x, y }}
        whileTap={{ scale: 0.95 }}
        className={`relative inline-flex items-center justify-center font-sans font-medium rounded-full transition-colors duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${baseVariantStyles[variant]} ${className}`}
      >
        {children}
      </motion.button>
    );
  };

  export default MagneticButton;
  ```

---

#### 3. `PerpetualFloat.tsx`
- **Location**: `src/components/ui/PerpetualFloat.tsx`
- **Purpose**: Isolated wrapper component for continuous floating micro-animations using framer-motion repeating spring dynamics. Decouples heavy CPU motion logic into an isolated client component.
- **Prop Interface**:
  ```typescript
  export interface PerpetualFloatProps {
    children: React.ReactNode;
    className?: string;
    yOffset?: number; // Max vertical offset in px, default: 8
    duration?: number; // Duration of full cycle in seconds, default: 4
    delay?: number; // Delay before animation starts in seconds, default: 0
  }
  ```
- **Implementation Design**:
  ```tsx
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
  ```

---

## 3. Caveats
1. **Directory Creation**: Worker must ensure `src/components/ui` directory is created before writing files.
2. **Strict Design Compliance**: Worker must verify that no inline styling or Tailwind class contains `#000000`, `purple`, `violet`, or `indigo` glowing borders.
3. **GPU Hardware Acceleration**: All motion components utilize `transform-gpu` or Framer Motion spring transforms to maintain smooth 60fps rendering without layout recalculations.

---

## 4. Conclusion
M1 (`framer-motion` setup) and M2 (creation of isolated client components `LiquidGlassContainer.tsx`, `MagneticButton.tsx`, and `PerpetualFloat.tsx`) are fully designed with exact TypeScript specifications, prop contracts, spring physics parameters, and MAANG visual constraints. The Worker can execute these tasks directly following the step-by-step guidance below.

---

## 5. Verification Method

### Worker Step-by-Step Implementation Guide
1. **Install Dependency**:
   ```bash
   cd "/Users/ankanghosh/Downloads/ats app/frontend"
   npm install framer-motion@^12.4.7
   ```
2. **Verify Installation**:
   Confirm `framer-motion` appears under `dependencies` in `package.json`.
3. **Create Component Files**:
   - Create directory `src/components/ui` if missing.
   - Write `src/components/ui/LiquidGlassContainer.tsx`.
   - Write `src/components/ui/MagneticButton.tsx`.
   - Write `src/components/ui/PerpetualFloat.tsx`.
4. **Compile & Type Check**:
   ```bash
   npx tsc -b
   ```
   Ensure zero TypeScript or linting errors.
