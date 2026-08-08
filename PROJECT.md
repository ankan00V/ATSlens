# Project: ATS Upload Form Revamp

## Architecture
- Vite 8 + React 19 SPA
- Asymmetric layout in `Hero.tsx` (split grid / offset layout)
- Isolated client components with `'use client'` directives for CPU-heavy perpetual micro-animations, liquid glass, and magnetic physics
- `framer-motion` for spring physics and magnetic hover attraction
- Premium MAANG-style design palette (Geist font, rich dark tones, no `#000000`, no Inter, no purple glowing borders)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Dependencies & Setup | Install `framer-motion` dependency in `package.json` | M1 | survey |
| 2 | Component Isolation & Physics | Create isolated `'use client'` components: `LiquidGlassContainer.tsx`, `MagneticButton.tsx`, `PerpetualFloat.tsx` using `framer-motion` spring physics | M2 | R2 |
| 3 | Asymmetric Hero Redesign | Redesign `Hero.tsx` with creative asymmetric layout (split-screen / offset grid, not centered `mx-auto`), integrating full ATS evaluation form logic & state | M3 | R1, R2 |
| 4 | Premium Styling Hardening | Enforce MAANG-style aesthetics: Geist font, rich dark tones (no `#000000`, no Inter, no purple glows), responsive mobile fallbacks | M4 | R3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Dependencies & Setup | `package.json` framer-motion installation & verification | none | DONE |
| 2 | M2: Isolated Animation Components | Create `LiquidGlassContainer.tsx`, `MagneticButton.tsx`, `PerpetualFloat.tsx` | M1 | DONE |
| 3 | M3: Asymmetric Hero Form Redesign | Revamp `Hero.tsx` layout and integrate upload form | M2 | DONE |
| 4 | M4: Design Compliance & Verification | Clean audit, remove pure black `#000000`, verify spring physics & mobile fallbacks | M3 | DONE |

## Interface Contracts
### `Hero.tsx` ↔ Isolated Animation Components
- `LiquidGlassContainer`: accepts `children`, `className`, `glassOpacity`
- `MagneticButton`: accepts `children`, `onClick`, `disabled`, `type`, `className`, `magnetDistance`
- `PerpetualFloat`: accepts `children`, `className`, `yOffset`, `duration`

## Code Layout
- `src/components/Hero.tsx` — Main Hero component with asymmetric layout & ATS upload form logic
- `src/components/ui/LiquidGlassContainer.tsx` — Liquid glass panel with spring physics backdrop
- `src/components/ui/MagneticButton.tsx` — Button with spring-based magnetic hover attraction
- `src/components/ui/PerpetualFloat.tsx` — Isolated perpetual float/pulse micro-animation wrapper
