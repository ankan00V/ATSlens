import React, { useRef, useState, useEffect } from 'react';
import { Upload, Sparkles, FileText, ArrowRight, RefreshCw, FileDown, CheckCircle2, X, Zap, ShieldCheck, Activity } from 'lucide-react';
import { SplineBackground } from './SplineBackground';
import { SubScoresBreakdown } from './SubScoresBreakdown';
import { TechStackRecommendations } from './TechStackRecommendations';
import { KeywordGapVisualizer } from './KeywordGapVisualizer';
import { exportEvaluationPdf } from '../utils/pdfExport';

function ScoreGauge({ score, max }: { score: number; max: number }) {
  const percentage = Math.max(0, Math.min(100, (score / max) * 100));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 70 ? 'hsl(var(--primary))' : percentage >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
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
        <span className="text-3xl font-bold text-foreground">{score}</span>
        <span className="text-sm text-muted-foreground font-medium">/ {max}</span>
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
  const color = percentage >= 70 ? 'bg-primary' : percentage >= 40 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="rounded-xl p-5 border border-border bg-secondary/40 backdrop-blur-md transition-all hover:border-primary/50">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-foreground text-base">
          {icon && <span className="mr-1.5">{icon}</span>}
          {label}
        </span>
        <span className="font-bold text-lg text-foreground">
          {score}
          <span className="text-muted-foreground font-normal text-sm">/{max}</span>
        </span>
      </div>
      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className={`h-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed font-light">{evidence}</p>
    </div>
  );
}

interface HeroSectionProps {
  isModalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  isModalOpen,
  onOpenModal,
  onCloseModal,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('senior_frontend_engineer');
  const [customRole, setCustomRole] = useState<string>('');
  const [yoe, setYoe] = useState<string>('3-5 years');
  const [jd, setJd] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [elapsed, setElapsed] = useState<number>(0);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);
  const [isBackendReady, setIsBackendReady] = useState<boolean>(false);
  const [showWakeupModal, setShowWakeupModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || '';
    const checkHealth = () => {
      fetch(`${API_URL}/api/roles`)
        .then((res) => {
          if (res.ok) {
            res.json().then((data) => {
              if (data.roles) setRoles(data.roles);
            });
            setIsBackendReady(true);
          } else {
            setTimeout(checkHealth, 3000);
          }
        })
        .catch((err) => {
          console.warn('Backend waking up...', err);
          setTimeout(checkHealth, 3000);
        });
    };
    checkHealth();
  }, []);

  useEffect(() => {
    if (isBackendReady && showWakeupModal) {
      setShowWakeupModal(false);
      onOpenModal();
    }
  }, [isBackendReady, showWakeupModal, onOpenModal]);

  useEffect(() => {
    if (loading) {
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!file) {
      setError('Please select a candidate resume PDF file.');
      return;
    }

    const activeRole = selectedRole === 'other' ? (customRole.trim() || 'custom_role') : selectedRole;
    if (selectedRole === 'other' && !customRole.trim()) {
      setError('Please enter a custom target role name.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', activeRole);
    if (yoe) formData.append('yoe', yoe);
    if (jd) formData.append('jd', jd);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/evaluate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Evaluation failed. Please verify the resume PDF.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const activeRoleLabel = selectedRole === 'other' ? (customRole.trim() || 'Custom Role') : selectedRole;

  const handleExportPdf = async () => {
    if (!result) return;
    setExportingPdf(true);
    try {
      await exportEvaluationPdf({ result, selectedRole: activeRoleLabel });
    } catch (err: any) {
      alert('Failed to export PDF: ' + err.message);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setFile(null);
  };

  return (
    <section className="relative min-h-screen flex items-end bg-hero-bg overflow-hidden font-sora">
      {/* 3D Spline Interactive Scene Background */}
      <SplineBackground sceneUrl="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode" />

      {/* Dark Overlay (pointer-events-none) */}
      <div className="absolute inset-0 bg-black/30 z-[1] pointer-events-none" />

      {/* Landing Page Hero Content */}
      <div className="relative z-10 pointer-events-none w-full max-w-[95%] sm:max-w-xl lg:max-w-3xl px-6 md:px-12 pb-16 pt-32 space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider animate-fade-up">
          <Zap className="w-3.5 h-3.5" />
          <span>Next-Gen Candidate Evaluation Engine</span>
        </div>

        {/* Heading */}
        <h1
          className="text-[clamp(3.5rem,8vw,6.5rem)] font-bold leading-[1.05] tracking-[-0.05em] text-foreground uppercase animate-fade-up"
          style={{ animationDelay: '0.1s' }}
        >
          ATSlens <span className="text-primary">AI</span>
        </h1>

        {/* Subheading */}
        <p
          className="text-foreground/90 text-[clamp(1.25rem,2.5vw,2rem)] font-light animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          We evaluate candidate resumes correctly.
        </p>

        {/* Description */}
        <p
          className="text-muted-foreground text-[clamp(0.95rem,1.5vw,1.25rem)] font-light leading-relaxed max-w-2xl animate-fade-up"
          style={{ animationDelay: '0.3s' }}
        >
          Enterprise security & assessment systems built in days. Smart skill gap analysis set up for your entire facility. All of it done right, not just fast.
        </p>

        {/* Primary Action Button */}
        <div
          className="flex flex-wrap gap-4 pt-2 font-bold animate-fade-up"
          style={{ animationDelay: '0.4s' }}
        >
          <button
            onClick={() => {
              if (isBackendReady) {
                onOpenModal();
              } else {
                setShowWakeupModal(true);
              }
            }}
            className="bg-primary text-primary-foreground px-8 py-4 text-xs rounded-md cursor-pointer hover:brightness-110 transition-all active:scale-[0.97] pointer-events-auto uppercase tracking-widest font-bold flex items-center gap-3 shadow-xl shadow-primary/25"
          >
            <span>Run AI Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Highlights Bar */}
        <div
          className="pt-6 border-t border-white/10 flex flex-wrap gap-6 text-xs text-muted-foreground uppercase font-mono tracking-wider animate-fade-up"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>100% Magic-Bytes Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span>PDF Report Export</span>
          </div>
        </div>
      </div>

      {/* Candidate Evaluation Modal / Page Drawer */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading) onCloseModal();
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
        >
          <div className="relative w-full max-w-3xl bg-background border border-border rounded-xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col pointer-events-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-foreground uppercase tracking-wider">
                  Candidate Evaluation Setup
                </h2>
              </div>
              <button
                onClick={() => !loading && onCloseModal()}
                disabled={loading}
                className={`p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all ${
                  loading ? 'opacity-25 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
                }`}
                title={loading ? 'Evaluation in progress...' : 'Close modal'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scroll Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
              {!result ? (
                <>
                  {/* Target Role & Experience Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1 font-semibold">
                        Target Role
                      </label>
                      <select
                        className="w-full bg-secondary text-foreground border border-border rounded-md p-3 text-xs font-medium outline-none focus:border-primary cursor-pointer"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                      >
                        {roles.length > 0 ? (
                          roles.map((r) => (
                            <option key={r} value={r} className="bg-background text-foreground">
                              {r.replace(/_/g, ' ').toUpperCase()}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="senior_frontend_engineer" className="bg-background text-foreground">SENIOR FRONTEND ENGINEER</option>
                            <option value="backend_engineer" className="bg-background text-foreground">BACKEND ENGINEER</option>
                            <option value="software_engineering_intern" className="bg-background text-foreground">SOFTWARE ENGINEERING INTERN</option>
                            <option value="product_manager" className="bg-background text-foreground">PRODUCT MANAGER</option>
                            <option value="data_scientist" className="bg-background text-foreground">DATA SCIENTIST</option>
                            <option value="devops_engineer" className="bg-background text-foreground">DEVOPS ENGINEER</option>
                            <option value="ux_designer" className="bg-background text-foreground">UX DESIGNER</option>
                          </>
                        )}
                        <option value="other" className="bg-background text-primary font-bold">
                          ✨ OTHER (TYPE CUSTOM ROLE...)
                        </option>
                      </select>

                      {/* Custom Role Text Input when 'other' is selected */}
                      {selectedRole === 'other' && (
                        <div className="mt-2.5 animate-fade-in">
                          <input
                            type="text"
                            placeholder="Enter custom target role (e.g. AI Ethics Lead, Quantum Computing Lead)..."
                            className="w-full bg-secondary text-foreground border border-primary/60 rounded-md p-3 text-xs font-medium outline-none focus:border-primary placeholder:text-muted-foreground/60"
                            value={customRole}
                            onChange={(e) => setCustomRole(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1 font-semibold">
                        Experience Level
                      </label>
                      <select
                        className="w-full bg-secondary text-foreground border border-border rounded-md p-3 text-xs font-medium outline-none focus:border-primary cursor-pointer"
                        value={yoe}
                        onChange={(e) => setYoe(e.target.value)}
                      >
                        <option value="0-1 years" className="bg-background text-foreground">0-1 years (Entry)</option>
                        <option value="1-3 years" className="bg-background text-foreground">1-3 years (Junior)</option>
                        <option value="3-5 years" className="bg-background text-foreground">3-5 years (Mid)</option>
                        <option value="5+ years" className="bg-background text-foreground">5+ years (Senior)</option>
                      </select>
                    </div>
                  </div>

                  {/* Job Description (JD) Input */}
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1 font-semibold">
                      Job Description (JD / Role Criteria)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Paste target Job Description (JD) or custom hiring criteria here to run Keyword Gap & Tech Stack alignment..."
                      className="w-full bg-secondary text-foreground border border-border rounded-md p-3 text-xs font-normal outline-none focus:border-primary resize-none placeholder:text-muted-foreground/60"
                      value={jd}
                      onChange={(e) => setJd(e.target.value)}
                    />
                  </div>

                  {/* Upload Zone */}
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1 font-semibold">
                      Upload Candidate Resume PDF
                    </label>
                    <div
                      onClick={handleUploadClick}
                      className="border border-dashed border-border hover:border-primary/60 rounded-md p-4 cursor-pointer flex items-center justify-between bg-secondary/30 hover:bg-secondary/60 transition-all"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Upload className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-xs font-medium text-foreground truncate">
                          {file ? file.name : 'Select Resume PDF file'}
                        </span>
                      </div>
                      {file ? (
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                          PDF MAX 10MB
                        </span>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                  </div>

                  {/* Loading State */}
                  {loading && (
                    <div className="bg-secondary/40 border border-primary/40 p-6 rounded-lg text-foreground space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">Evaluating Resume...</h4>
                        <span className="ml-auto text-xs font-mono text-muted-foreground">{elapsed}s</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-light">
                        {elapsed < 15
                          ? 'Parsing PDF structure & sections...'
                          : elapsed < 30
                          ? 'Mapping skill sets against target role...'
                          : 'Finalizing assessment breakdown...'}
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-destructive/20 border border-destructive/50 p-4 rounded-md text-xs text-destructive-foreground">
                      <p className="font-semibold">{error}</p>
                    </div>
                  )}

                  {/* Submit Scan Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleScan}
                      disabled={loading}
                      className="w-full bg-primary text-primary-foreground py-4 text-xs font-bold uppercase tracking-widest rounded-md hover:brightness-110 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{loading ? 'Evaluating Resume...' : 'Start ATS Scan & Score'}</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Assessment Results View inside Modal */
                <div className="space-y-6">
                  <div className="flex items-center justify-between max-md:flex-col max-md:gap-6 border-b border-border pb-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Assessment Complete</span>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-1 uppercase tracking-tight">ATS Evaluation Score</h3>
                      <p className="text-muted-foreground text-xs mb-4">
                        Target Role: <span className="font-semibold text-foreground">{activeRoleLabel.replace(/_/g, ' ').toUpperCase()}</span>
                      </p>

                      <button
                        onClick={handleExportPdf}
                        disabled={exportingPdf}
                        className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold text-primary-foreground bg-primary hover:brightness-110 rounded-sm transition-all flex items-center gap-2 cursor-pointer"
                      >
                        {exportingPdf ? (
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FileDown className="w-4 h-4" />
                        )}
                        <span>{exportingPdf ? 'Exporting PDF...' : 'Download Report PDF'}</span>
                      </button>
                    </div>

                    <ScoreGauge score={result.overall_score} max={result.max_score} />
                  </div>

                  {/* Sub-Score Breakdown */}
                  <SubScoresBreakdown subScores={result.sub_scores} categoryScores={result.category_scores || result.scores} />

                  {/* Tech Stack Recommendations */}
                  <TechStackRecommendations
                    missingTechStack={result.missing_tech_stack}
                    skillRecommendations={result.skill_recommendations}
                  />

                  {/* Keyword Gap Visualizer */}
                  <KeywordGapVisualizer keywordGap={result.keyword_gap_analysis} />

                  {/* Category Breakdown */}
                  <div className="p-5 rounded-lg border border-border bg-secondary/30">
                    <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Section Breakdown Scores</h4>
                    <div className="grid grid-cols-1 gap-3">
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
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                      <h4 className="text-xs font-bold text-primary flex items-center gap-2 mb-2 uppercase tracking-wider">
                        ✅ Key Strengths
                      </h4>
                      <ul className="space-y-1.5">
                        {result.key_strengths?.map((s: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-foreground text-xs leading-relaxed font-light">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                      <h4 className="text-xs font-bold text-destructive flex items-center gap-2 mb-2 uppercase tracking-wider">
                        🔧 Areas for Improvement
                      </h4>
                      <ul className="space-y-1.5">
                        {result.areas_for_improvement?.map((s: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-foreground text-xs leading-relaxed font-light">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Reset / Evaluate Another Button */}
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 text-xs uppercase tracking-widest font-bold text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Evaluate Another Candidate</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Render Wake-up Modal */}
      {showWakeupModal && !isBackendReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border max-w-md w-full p-8 rounded-lg shadow-2xl flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Activity className="w-12 h-12 text-primary animate-pulse relative z-10" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                Mr. Render is waking up... 😴
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Just a sec! By that time, prepare your JD and resume. 
              </p>
            </div>

            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-full animate-progress" style={{ width: '50%' }} />
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              Please prepare your resume and job description. This popup will close automatically once the backend is ready.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
