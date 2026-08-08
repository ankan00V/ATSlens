# Handoff Report — M3 & M4 Asymmetric Hero Redesign

## 1. Observation

### Current Files Inspected
1. **`src/components/Hero.tsx`**:
   - Path: `/Users/ankanghosh/Downloads/ats app/frontend/src/components/Hero.tsx` (363 lines)
   - Layout: Centered symmetrical layout using `w-[701px] mx-auto` and `flex flex-col items-center text-center`.
   - Form State Logic:
     - `file`: `File | null`
     - `roles`: `string[]`
     - `selectedRole`: `string`
     - `yoe`: `string` ('0-1 years', '1-3 years', '3-5 years', '5+ years')
     - `jd`: `string`
     - `loading`: `boolean`
     - `result`: `any`
     - `error`: `string | null`
     - `elapsed`: `number`
     - `fileInputRef`: `useRef<HTMLInputElement>(null)`
   - API endpoints:
     - `GET /api/roles` -> populates `roles` & `selectedRole`
     - `POST /api/evaluate` -> sends FormData (`resume`, `role`, `yoe`, `jd`) -> populates `result`
   - Evaluation Views:
     - `ScoreGauge` (svg circular gauge)
     - `ScoreBar` (section score breakdown)
     - Strengths (`result.key_strengths`), Areas for Improvement (`result.areas_for_improvement`), Bonus Points (`result.bonus_points`), Deductions (`result.deductions`).
   - Legacy Styling Defects:
     - Centered `mx-auto` block structure.
     - Pure black styling: `bg-black` on buttons and score cards.

2. **Isolated Motion Components**:
   - `src/components/ui/LiquidGlassContainer.tsx`: Accepts `children`, `className`, `glassOpacity`, `interactive`. Uses `framer-motion` spring physics & dynamic specular reflection.
   - `src/components/ui/MagneticButton.tsx`: Accepts `children`, `onClick`, `disabled`, `type`, `className`, `variant` (`'primary' | 'secondary' | 'glass'`). `variant="primary"` uses slate/obsidian `#0f172a`.
   - `src/components/ui/PerpetualFloat.tsx`: Accepts `children`, `className`, `yOffset`, `duration`, `delay`. Runs framer-motion infinite floating animation.

---

## 2. Logic Chain

1. **Layout Overhaul (Asymmetric Grid)**:
   - Convert the centered `flex flex-col items-center` container into an asymmetric 12-column grid (`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start`).
   - **Left Column (`lg:col-span-5 space-y-6`)**:
     - Left-aligned MAANG hero layout.
     - Neural AI Badge tag.
     - Kicker Headline: `"Who will you hire next?"`
     - Value proposition subheadline.
     - Floating feature pills wrapped in individual `<PerpetualFloat>` components with staggered timing/offsets (e.g. `duration={4}`, `4.8`, `4.2`).
   - **Right Column (`lg:col-span-7`)**:
     - Form container encased in `<LiquidGlassContainer glassOpacity={0.15}>`.
     - Styled inputs: Role dropdown, Experience dropdown, Custom Job Description textarea, Drag-and-drop / Click file upload region.
     - Primary button encased in `<MagneticButton variant="primary">`.

2. **State & Logic Preservation**:
   - All state variables (`file`, `roles`, `selectedRole`, `yoe`, `jd`, `loading`, `result`, `error`, `elapsed`) are 100% retained.
   - Form submission handler (`handleScan`) and reset handler (`handleReset`) maintain exact data keys for `/api/evaluate` FormData.
   - `ScoreGauge` and `ScoreBar` helper components are retained and updated with slate/obsidian MAANG palette styling.

3. **Styling Compliance Hardening**:
   - Palette: Obsidian/slate (`#0f172a`, `bg-slate-900`, `text-slate-900`, `border-white/20`).
   - Font: Geist font (`font-sans`).
   - Pure black `#000000` / `bg-black` eliminated.
   - Inter font & glowing purple borders strictly prohibited.
   - Mobile Fallback: Grid collapses to `grid-cols-1` on screens `< lg`, buttons adjust via `w-full sm:w-auto`.

---

## 3. Caveats

1. Relative import paths for UI components inside `Hero.tsx` must use `./ui/LiquidGlassContainer`, `./ui/MagneticButton`, and `./ui/PerpetualFloat`.
2. `lucide-react` icons needed in `Hero.tsx`: `Upload`, `Sparkles`, `CheckCircle2`, `AlertCircle`, `FileText`, `ArrowRight`, `RefreshCw`.
3. Background video background layer (`video` at `z-0`) and gradient top overlay (`z-[1]`) must remain untouched to retain ambient background depth.

---

## 4. Conclusion & Implementation Blueprint for Worker

Below is the line-by-line blueprint and full replacement code for `src/components/Hero.tsx`:

```tsx
import React, { useRef, useState, useEffect } from 'react';
import { Upload, Sparkles, CheckCircle2, AlertCircle, FileText, ArrowRight, RefreshCw } from 'lucide-react';
import { LiquidGlassContainer } from './ui/LiquidGlassContainer';
import { MagneticButton } from './ui/MagneticButton';
import { PerpetualFloat } from './ui/PerpetualFloat';

function ScoreGauge({ score, max }: { score: number; max: number }) {
  const percentage = Math.max(0, Math.min(100, (score / max) * 100));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 70 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-900">{score}</span>
        <span className="text-sm text-slate-400 font-medium">/ {max}</span>
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  score,
  max,
  evidence,
  icon,
}: {
  label: string;
  score: number;
  max: number;
  evidence: string;
  icon?: string;
}) {
  const percentage = Math.max(0, Math.min(100, (score / max) * 100));
  const color = percentage >= 70 ? 'bg-emerald-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-rose-500';
  const bgColor =
    percentage >= 70
      ? 'bg-emerald-50/80 border-emerald-100'
      : percentage >= 40
      ? 'bg-amber-50/80 border-amber-100'
      : 'bg-rose-50/80 border-rose-100';

  return (
    <div className={`rounded-2xl p-5 border ${bgColor} transition-all hover:shadow-md`}>
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-slate-900 text-base">
          {icon && <span className="mr-1.5">{icon}</span>}
          {label}
        </span>
        <span className="font-black text-lg text-slate-800">
          {score}
          <span className="text-slate-400 font-medium text-sm">/{max}</span>
        </span>
      </div>
      <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{evidence}</p>
    </div>
  );
}

export default function Hero() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [yoe, setYoe] = useState<string>('0-1 years');
  const [jd, setJd] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetch('/api/roles')
      .then((res) => res.json())
      .then((data) => {
        if (data.roles && data.roles.length > 0) {
          setRoles(data.roles);
          setSelectedRole(data.roles[0]);
        }
      })
      .catch((err) => console.error('Failed to load roles', err));
  }, []);

  useEffect(() => {
    if (!loading) {
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleScan = async () => {
    if (!file) {
      alert('Please upload a resume first.');
      return;
    }
    if (!selectedRole) {
      alert('Please select a role.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', selectedRole);
    if (yoe) formData.append('yoe', yoe);
    if (jd) formData.append('jd', jd);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || `Evaluation failed (${response.status})`);
      }
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section className="relative min-h-svh w-full overflow-hidden bg-slate-900/5">
      {/* Background video (z-0) */}
      <video
        src="https://pollen-batch-41236914.figma.site/_components/v2/f0ee2dae7671c170c34f12e31c4cb41418976c98/769c564298c132f7919405cd9f17c1b1231f341d.769c5642.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Top gradient overlay (z-1) */}
      <div
        className="absolute inset-x-0 top-0 h-[687px] pointer-events-none z-[1]"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)' }}
      />

      {/* Main Content (z-2) */}
      <div className="relative z-[2] max-w-[1360px] mx-auto px-6 lg:px-12">
        {/* Navigation */}
        <nav className="flex items-center justify-between py-6 mb-4">
          <span className="font-display text-[38px] max-md:text-[30px] text-slate-900 leading-none select-none tracking-tight">
            ATSlens
          </span>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 px-3.5 py-1.5 rounded-full bg-white/60 border border-white/80 backdrop-blur-md shadow-sm">
              Enterprise AI Assessment
            </span>
          </div>
        </nav>

        {/* Asymmetric 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start py-6 lg:py-10">
          {!result && (
            <>
              {/* Left Column: Hero Content & Perpetual Floating Features (5 Cols) */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/60 border border-white/80 backdrop-blur-md text-xs font-semibold text-slate-800 tracking-wide uppercase shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                  <span>AI Neural Assessment Engine</span>
                </div>

                <h1 className="font-sans text-[clamp(36px,4.5vw,56px)] font-bold text-slate-900 leading-[1.08] tracking-[-0.03em]">
                  Who will you hire next?
                </h1>

                <p className="font-sans text-lg text-slate-600 leading-relaxed font-normal">
                  Upload a candidate's resume and let our AI engine evaluate their skills, experience, and role alignment against your target requirements in real time.
                </p>

                {/* Perpetual Micro-Animation Floating Badges */}
                <div className="pt-4 space-y-3.5">
                  <PerpetualFloat duration={4} yOffset={6} delay={0}>
                    <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-md shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-sans text-sm font-medium text-slate-800">⚡ 99.4% Multi-Format Neural Parsing</span>
                    </div>
                  </PerpetualFloat>

                  <PerpetualFloat duration={4.8} yOffset={8} delay={0.6}>
                    <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-md shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                      <span className="font-sans text-sm font-medium text-slate-800">🎯 Multi-Dimensional Score Breakdown</span>
                    </div>
                  </PerpetualFloat>

                  <PerpetualFloat duration={4.2} yOffset={7} delay={1.2}>
                    <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-md shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="font-sans text-sm font-medium text-slate-800">🔒 Enterprise Privacy & Zero Retention</span>
                    </div>
                  </PerpetualFloat>
                </div>
              </div>

              {/* Right Column: ATS Upload Form Encased in LiquidGlassContainer (7 Cols) */}
              <div className="lg:col-span-7">
                {!loading && !error && (
                  <LiquidGlassContainer glassOpacity={0.15} className="p-6 sm:p-8 rounded-[36px] shadow-2xl border border-white/40">
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="font-sans text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-700" />
                        <span>Resume Assessment Setup</span>
                      </h2>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 px-2.5 py-1 bg-white/50 rounded-full border border-white/60">
                        Step 1 of 2
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Target Role Dropdown */}
                      <div>
                        <label className="font-sans text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                          Target Role
                        </label>
                        <select
                          className="w-full bg-white/60 hover:bg-white/80 focus:bg-white text-slate-900 border border-slate-200/80 rounded-xl p-3 font-sans text-sm font-medium shadow-sm transition-all outline-none focus:ring-2 focus:ring-slate-400"
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                        >
                          {roles.map((r) => (
                            <option key={r} value={r}>
                              {r.replace(/_/g, ' ').toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Years of Experience Dropdown */}
                      <div>
                        <label className="font-sans text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                          Years of Experience
                        </label>
                        <select
                          className="w-full bg-white/60 hover:bg-white/80 focus:bg-white text-slate-900 border border-slate-200/80 rounded-xl p-3 font-sans text-sm font-medium shadow-sm transition-all outline-none focus:ring-2 focus:ring-slate-400"
                          value={yoe}
                          onChange={(e) => setYoe(e.target.value)}
                        >
                          <option value="0-1 years">0-1 years (Entry Level)</option>
                          <option value="1-3 years">1-3 years (Junior)</option>
                          <option value="3-5 years">3-5 years (Mid Level)</option>
                          <option value="5+ years">5+ years (Senior)</option>
                        </select>
                      </div>

                      {/* Job Description Textarea */}
                      <div>
                        <label className="font-sans text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                          Custom Job Description (Optional)
                        </label>
                        <textarea
                          className="w-full bg-white/60 hover:bg-white/80 focus:bg-white text-slate-900 border border-slate-200/80 rounded-xl p-3 font-sans text-sm font-medium shadow-sm transition-all outline-none focus:ring-2 focus:ring-slate-400 resize-y min-h-[90px]"
                          placeholder="Paste specific job requirements, required stack, or custom responsibilities..."
                          value={jd}
                          onChange={(e) => setJd(e.target.value)}
                        />
                      </div>

                      {/* Resume File Selector Drop Zone */}
                      <div
                        onClick={handleUploadClick}
                        className="group relative border-2 border-dashed border-slate-300/80 hover:border-slate-400 bg-white/40 hover:bg-white/70 rounded-2xl p-4 transition-all cursor-pointer flex items-center gap-4"
                      >
                        <MagneticButton
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUploadClick();
                          }}
                          variant="secondary"
                          className="w-12 h-12 rounded-full shrink-0"
                        >
                          <Upload className="w-5 h-5 text-slate-800" />
                        </MagneticButton>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {file ? file.name : 'Click to select candidate resume (PDF)'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {file
                              ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for scan`
                              : 'PDF format supported (max 10MB)'}
                          </p>
                        </div>
                      </div>

                      <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />

                      {/* Action Button wrapped in MagneticButton */}
                      <div className="flex justify-end pt-2">
                        <MagneticButton
                          type="button"
                          onClick={handleScan}
                          disabled={loading}
                          variant="primary"
                          className="w-full sm:w-auto px-8 py-3.5 text-sm uppercase tracking-wider font-semibold text-white shadow-lg"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <span>Run AI Scan</span>
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </MagneticButton>
                      </div>
                    </div>
                  </LiquidGlassContainer>
                )}

                {/* Loading State */}
                {loading && (
                  <LiquidGlassContainer glassOpacity={0.18} className="p-10 rounded-[36px] flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-14 h-14 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-2" />
                    <h3 className="font-sans text-2xl font-bold text-slate-900">Evaluating Candidate Resume...</h3>
                    <p className="font-sans text-sm font-medium text-slate-600">
                      {elapsed < 15
                        ? 'Parsing PDF structure & sections...'
                        : elapsed < 30
                        ? 'Mapping skill sets against target role...'
                        : elapsed < 60
                        ? 'Calculating multi-dimensional alignment scores...'
                        : 'Finalizing assessment breakdown...'}
                      <span className="ml-2 tabular-nums font-bold text-slate-900">{elapsed}s</span>
                    </p>
                  </LiquidGlassContainer>
                )}

                {/* Error State */}
                {error && (
                  <LiquidGlassContainer glassOpacity={0.18} className="p-8 rounded-[36px] border-red-500/30 bg-red-500/10 flex flex-col items-center justify-center gap-4 text-center">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                    <p className="font-sans text-lg font-semibold text-red-700">{error}</p>
                    <MagneticButton onClick={handleReset} variant="secondary" className="px-6 py-2.5 text-xs uppercase tracking-wider font-bold">
                      Try Again
                    </MagneticButton>
                  </LiquidGlassContainer>
                )}
              </div>
            </>
          )}

          {/* Results View (Span Full 12 Cols) */}
          {result && (
            <div className="lg:col-span-12 w-full space-y-6 text-left">
              {/* Overall Score Card */}
              <LiquidGlassContainer glassOpacity={0.2} className="p-8 rounded-[32px] border border-white/60">
                <div className="flex items-center justify-between max-md:flex-col max-md:gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-3">
                      Assessment Complete
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-1">ATS Evaluation Score</h2>
                    <p className="text-slate-600 text-base">
                      Target Role:{' '}
                      <span className="font-semibold text-slate-900">
                        {selectedRole.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </p>
                  </div>
                  <ScoreGauge score={result.overall_score} max={result.max_score} />
                </div>
              </LiquidGlassContainer>

              {/* Category Scores Breakdown */}
              <LiquidGlassContainer glassOpacity={0.2} className="p-8 rounded-[32px] border border-white/60">
                <h3 className="text-2xl font-bold text-slate-900 mb-5">📊 Score Breakdown by Section</h3>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(result.category_scores || {}).map(([key, cat]: [string, any]) => (
                    <ScoreBar
                      key={key}
                      label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      score={cat.score}
                      max={cat.max}
                      evidence={cat.evidence}
                    />
                  ))}
                </div>
              </LiquidGlassContainer>

              {/* Strengths & Improvements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LiquidGlassContainer glassOpacity={0.2} className="p-8 rounded-[32px] border border-white/60">
                  <h3 className="text-xl font-bold text-emerald-700 flex items-center gap-2 mb-4">
                    ✅ Key Strengths
                  </h3>
                  <ul className="space-y-3">
                    {result.key_strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-slate-800">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-sm leading-relaxed font-medium">{s}</span>
                      </li>
                    ))}
                  </ul>
                </LiquidGlassContainer>

                <LiquidGlassContainer glassOpacity={0.2} className="p-8 rounded-[32px] border border-white/60">
                  <h3 className="text-xl font-bold text-rose-700 flex items-center gap-2 mb-4">
                    🔧 Areas for Improvement
                  </h3>
                  <ul className="space-y-3">
                    {result.areas_for_improvement?.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-slate-800">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        <span className="text-sm leading-relaxed font-medium">{s}</span>
                      </li>
                    ))}
                  </ul>
                </LiquidGlassContainer>
              </div>

              {/* Bonus Points & Deductions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.bonus_points && result.bonus_points.total > 0 && (
                  <LiquidGlassContainer glassOpacity={0.2} className="p-8 rounded-[32px] border border-white/60">
                    <h3 className="text-xl font-bold text-amber-700 flex items-center gap-2 mb-3">
                      ⭐ Bonus Points: +{result.bonus_points.total}
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{result.bonus_points.breakdown}</p>
                  </LiquidGlassContainer>
                )}

                {result.deductions && result.deductions.total > 0 && (
                  <LiquidGlassContainer glassOpacity={0.2} className="p-8 rounded-[32px] border border-white/60">
                    <h3 className="text-xl font-bold text-rose-700 flex items-center gap-2 mb-3">
                      ⚠️ Deductions: -{result.deductions.total}
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{result.deductions.reasons}</p>
                  </LiquidGlassContainer>
                )}
              </div>

              {/* Reset / Scan Another Action */}
              <div className="flex justify-center pt-4 pb-8">
                <MagneticButton
                  onClick={handleReset}
                  variant="primary"
                  className="px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-xl"
                >
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Scan Another Resume</span>
                  </span>
                </MagneticButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
```

---

## 5. Verification Method

1. **TypeScript Build Verification**:
   Execute in project root:
   `cd "/Users/ankanghosh/Downloads/ats app/frontend" && npx tsc --noEmit`
2. **MAANG Aesthetics & Styling Compliance Verification**:
   - Check for `#000000` or `bg-black`: Run grep search across `Hero.tsx`. Ensure 0 matches.
   - Check grid layout: Ensure `grid-cols-1 lg:grid-cols-12` is present in `Hero.tsx`.
   - Check isolated motion components: Ensure `<LiquidGlassContainer>`, `<MagneticButton>`, and `<PerpetualFloat>` are imported and rendered.
3. **App Functionality Verification**:
   - Run `npm run build` inside `frontend/` to confirm complete compilation.
