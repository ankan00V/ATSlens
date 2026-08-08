# Original User Request

## 2026-08-08T00:42:00Z

Revamp the existing Applicant Tracking System (ATS) upload form in `Hero.tsx` to have a premium, MAANG-style visual design with an asymmetric layout and high-intensity animations (liquid glass, magnetic buttons).

Working directory: /Users/ankanghosh/Downloads/ats app/frontend
Integrity mode: development

## Requirements

### R1. Layout Architecture
Redesign the form layout to be asymmetric and creative (e.g., split screen or offset grid). Do not use a centered, symmetrical block.

### R2. High-Intensity Motion
Implement advanced animations including liquid glass, magnetic hover states on buttons, and perpetual micro-animations (e.g., pulse or float). Isolate CPU-heavy perpetual animations in their own Client Components.

### R3. Premium Styling Constraints
Apply premium design guidelines: use high-end Sans-Serif fonts, avoid generic AI styling (no purple glows, pure black, or over-saturated accents), and ensure proper fallback for mobile layouts.

## Acceptance Criteria

### Technical Implementation
- [ ] Code includes `framer-motion` imports (or similar high-end physics library) and utilizes spring physics.
- [ ] Heavy animations are isolated with `'use client'` directives.
- [ ] The layout uses CSS Grid or Flexbox to achieve an asymmetric structure (not just `mx-auto` centered).
- [ ] No generic AI design patterns (e.g., `#000000`, Inter font, glowing purple borders) are present in the CSS/Tailwind classes.
