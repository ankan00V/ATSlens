# Handoff Report — explorer_survey_1: Hero.tsx & Upload Form Analysis

## 1. Observation

### 1.1 File Location & Component Structure
- **File Location**: `/Users/ankanghosh/Downloads/ats app/frontend/src/components/Hero.tsx`
- **Main Component Export**: `export default function Hero()` (Lines 46–362), taking zero props.
- **Parent Component Usage**: Imported in `/Users/ankanghosh/Downloads/ats app/frontend/src/App.tsx` (Line 1, 6) as `<Hero />`.
- **Sub-components defined in `Hero.tsx`**:
  - `ScoreGauge({ score, max }: { score: number, max: number })` (Lines 4–25): SVG circular meter displaying overall ATS score, rotated -90 degrees, color-coded based on percentage (Green `>=70%` (`#22c55e`), Amber `>=40%` (`#f59e0b`), Red `<40%` (`#ef4444`)).
  - `ScoreBar({ label, score, max, evidence, icon }: { label: string, score: number, max: number, evidence: string, icon?: string })` (Lines 27–44): Horizontal category progress bar with dynamic color fill (`bg-green-500`, `bg-amber-500`, `bg-red-500`) and evidence text description.

### 1.2 State & Refs in `Hero.tsx`
- `fileInputRef`: `useRef<HTMLInputElement>(null)` (Line 47) — Ref attached to hidden file input (`<input type="file" accept=".pdf" className="hidden" />`).
- `file`: `useState<File | null>(null)` (Line 48) — Stores candidate's uploaded resume PDF file object.
- `roles`: `useState<string[]>([])` (Line 49) — List of available target roles fetched dynamically from `/api/roles`.
- `selectedRole`: `useState<string>('')` (Line 50) — Currently selected target role value.
- `yoe`: `useState<string>('0-1 years')` (Line 51) — Selected years of experience level.
- `jd`: `useState<string>('')` (Line 52) — Custom job description text.
- `loading`: `useState<boolean>(false)` (Line 53) — Async evaluation request status.
- `result`: `useState<any>(null)` (Line 54) — API evaluation response payload containing scores, breakdown, key strengths, improvements, bonus, deductions.
- `error`: `useState<string | null>(null)` (Line 55) — Error message string.
- `elapsed`: `useState<number>(0)` (Line 56) — Timer tracking duration in seconds during active scan.

### 1.3 Event Handlers & API Integration
1. **Roles Fetch Effect** (Lines 58–68):
   ```tsx
   useEffect(() => {
     fetch('/api/roles')
       .then(res => res.json())
       .then(data => {
         if (data.roles && data.roles.length > 0) {
           setRoles(data.roles);
           setSelectedRole(data.roles[0]);
         }
       })
       .catch(err => console.error("Failed to load roles", err));
   }, []);
   ```
2. **Elapsed Timer Effect** (Lines 71–75):
   ```tsx
   useEffect(() => {
     if (!loading) { setElapsed(0); return; }
     const interval = setInterval(() => setElapsed(e => e + 1), 1000);
     return () => clearInterval(interval);
   }, [loading]);
   ```
3. **File Upload Handlers** (Lines 77–85):
   - `handleUploadClick`: Triggers hidden file input click (`fileInputRef.current?.click()`).
   - `handleFileChange`: Reads `e.target.files[0]` and sets `file` state.
4. **Scan Submission Handler (`handleScan`)** (Lines 87–123):
   - Validates `file` existence (`alert("Please upload a resume first.")`).
   - Validates `selectedRole` selection (`alert("Please select a role.")`).
   - Builds `FormData`:
     - `formData.append("resume", file)`
     - `formData.append("role", selectedRole)`
     - `formData.append("yoe", yoe)` (if set)
     - `formData.append("jd", jd)` (if set)
   - Sends HTTP `POST` to `/api/evaluate` with `body: formData`.
   - On success (`response.ok`): stores JSON response payload in `result`.
   - On error: extracts error message into `error` state.
5. **Reset Handler (`handleReset`)** (Lines 125–131):
   - Clears `file`, `result`, `error`, `loading`, and resets `fileInputRef.current.value = ''`.

### 1.4 Current Layout & Visual Structure
- **Section Envelope**: `<section className="relative min-h-svh w-full overflow-hidden">`
  - Background `<video>` element (Lines 136–143) loading external video URL `https://pollen-batch-41236914.figma.site/.../769c5642.mp4` with `absolute inset-0 w-full h-full object-cover z-0`.
  - Top white-to-transparent gradient overlay (Lines 146–149) with `h-[687px] pointer-events-none z-[1]`.
  - Inner container: `<div className="relative z-[2] max-w-[1360px] mx-auto">`.
- **Header Navigation**: `<nav className="flex items-center justify-between px-20 pt-6 pb-4 max-md:px-6 max-md:pt-5">` rendering logo text `"ATSlens"`.
- **Form Card Container**:
  - **Symmetrical Centered Grid/Box**: Single column container centered with `mx-auto` (`w-[701px] max-md:w-[calc(100vw-48px)]`).
  - **Styles**: Glassmorphism styling (`bg-white/10 border border-white/40 rounded-[44px] shadow-2xl backdrop-blur-[24px] p-6 pb-[90px]`).
  - **Inputs inside form card**:
    1. Target Role Dropdown (`<select className="w-full bg-white/50 border border-white rounded-lg p-2 font-sans text-base outline-none">`).
    2. Years of Experience Dropdown (`<select className="w-full bg-white/50 border border-white rounded-lg p-2 font-sans text-base outline-none">`). Options: `0-1 years (Entry Level)`, `1-3 years (Junior)`, `3-5 years (Mid Level)`, `5+ years (Senior)`.
    3. Custom Job Description Textarea (`<textarea className="w-full bg-white/50 border border-white rounded-lg p-3 font-sans text-base outline-none resize-y min-h-[100px]">`).
    4. Selected file summary text (`<p className="font-sans text-xl max-md:text-[17px] font-medium text-white drop-shadow-md leading-relaxed truncate pr-[180px]">`).
    5. Upload Button: Circular absolute button (`absolute left-[24px] bottom-[24px] w-12 h-12 bg-transparent border border-white/70 rounded-full`) containing Lucide `<Upload />` icon.
    6. Run Scan Button: Absolute pill button (`absolute bottom-[21px] right-[21px] w-[156px] h-14 bg-black rounded-[44px]`) with text `"RUN SCAN"`.
- **Results View Container** (Lines 259–356):
  - Renders when `result` state is non-null (`w-[900px] max-w-full text-left font-sans space-y-6`).
  - Includes Overall Score Card with `ScoreGauge`, Category Scores with `ScoreBar`, Key Strengths & Areas for Improvement grids, Bonus & Deductions cards, and "Scan Another Resume" reset button.

### 1.5 Dependencies & Imports
- **Current Imports in `Hero.tsx`**:
  - `React, { useRef, useState, useEffect }` from `'react'`
  - `Upload` from `'lucide-react'`
- **Package Dependencies (`/frontend/package.json`)**:
  - `clsx`: `^2.1.1`
  - `lucide-react`: `^1.30.0`
  - `react`: `^19.2.8`
  - `react-dom`: `^19.2.8`
  - `tailwind-merge`: `^3.6.0`
  - `@tailwindcss/postcss`: `^4.3.3`
  - `tailwindcss`: `^3.4.17`
- **Missing Required Animation Libraries**:
  - `framer-motion` (or equivalent spring physics library) is **not installed** in `package.json`.

---

## 2. Logic Chain

1. **Observation 1.1 & 1.4**: `Hero.tsx` uses a single centered block container (`w-[701px] mx-auto`) for the upload form.
   - *Inference*: This directly violates requirement **R1** from `ORIGINAL_REQUEST.md`, which mandates an asymmetric, creative layout (e.g. split-screen or offset grid) rather than a centered symmetrical card.

2. **Observation 1.5**: `package.json` contains `react`, `lucide-react`, `tailwindcss`, but does **not** list `framer-motion`. `Hero.tsx` relies solely on basic CSS transitions (`transition-all duration-1000 ease-out`).
   - *Inference*: Meeting requirement **R2** ("High-Intensity Motion" using liquid glass, magnetic hover states, perpetual micro-animations, isolated Client Components, and spring physics) will require installing `framer-motion` and refactoring animation elements.

3. **Observation 1.2 & 1.3**: The ATS form state management and upload logic rely on 5 form field/state hooks (`file`, `selectedRole`, `yoe`, `jd`, `loading`) and 2 API calls (`GET /api/roles`, `POST /api/evaluate` via `FormData`).
   - *Inference*: To maintain 100% functional parity during redesign, any refactored or sub-divided Client Components must preserve these exact state hooks, FormData construction (`resume`, `role`, `yoe`, `jd`), and API handlers (`/api/roles`, `/api/evaluate`).

4. **Observation 1.4**: The background video (`video` element at z-0) and top gradient overlay (z-1) provide visual context, while the content layer operates at z-2.
   - *Inference*: Design updates can enhance the glassmorphism aesthetic over the background video while reorganizing the form into an asymmetric 2-column or offset grid layout (e.g. Left column: branding, title, status, micro-animations; Right column: elevated upload form and parameters).

---

## 3. Caveats

- **Backend API availability**: `/api/roles` and `/api/evaluate` are served by the Python FastAPI backend (`app.py` in root). During frontend static build testing (`npm run build`), API calls are mocked or unreached, but form state logic remains fully testable.
- **Node package manager**: `npm` is available in the environment to install `framer-motion` when implementing redesigns.
- **Scope limitation**: Explorer Survey 1 is strictly a **read-only investigation**. No modifications were made to `Hero.tsx` or any project source files during this phase.

---

## 4. Conclusion

1. `Hero.tsx` is located at `/Users/ankanghosh/Downloads/ats app/frontend/src/components/Hero.tsx`. It is a self-contained React component that handles role fetching, resume file selection, parameters selection, submission via FormData to `/api/evaluate`, and evaluation score rendering.
2. The current upload form is housed inside a centered 701px symmetrical card with standard inputs (select role, select YOE, custom JD textarea, hidden file input, upload icon button, black "RUN SCAN" button).
3. `Hero.tsx` only imports `react` hooks and `<Upload />` from `lucide-react`. `framer-motion` is not yet installed.
4. Redesigning `Hero.tsx` to meet `ORIGINAL_REQUEST.md` requires:
   - Installing `framer-motion` in `frontend`.
   - Restructuring `Hero.tsx` into an asymmetric layout (e.g., offset 2-column split grid).
   - Extracting heavy animation elements into isolated Client Components.
   - Upgrading visual aesthetics to MAANG-style liquid glass, magnetic buttons, and custom typography while maintaining full functional integration with `/api/roles` and `/api/evaluate`.

---

## 5. Verification Method

### 5.1 Verification Commands
- Check component existence and contents:
  ```bash
  cat "/Users/ankanghosh/Downloads/ats app/frontend/src/components/Hero.tsx"
  ```
- Run production build check:
  ```bash
  cd "/Users/ankanghosh/Downloads/ats app/frontend" && npm run build
  ```

### 5.2 Files to Inspect
- `/Users/ankanghosh/Downloads/ats app/frontend/src/components/Hero.tsx`
- `/Users/ankanghosh/Downloads/ats app/frontend/src/App.tsx`
- `/Users/ankanghosh/Downloads/ats app/frontend/package.json`

### 5.3 Invalidation Conditions
- If `Hero.tsx` is moved or split into multiple files before implementation starts.
- If `/api/evaluate` FormData contract (`resume`, `role`, `yoe`, `jd`) changes on the backend.
