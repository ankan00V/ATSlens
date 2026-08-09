import React from 'react';
import { Briefcase, Code, GraduationCap, Zap } from 'lucide-react';
import { LiquidGlassContainer } from './ui/LiquidGlassContainer';

export interface CategoryScoreData {
  score: number;
  max: number;
  evidence?: string;
}

interface SubScoresBreakdownProps {
  subScores?: any; // Kept for backwards compatibility
  categoryScores?: Record<string, CategoryScoreData>;
}

export const SubScoresBreakdown: React.FC<SubScoresBreakdownProps> = ({ categoryScores, subScores }) => {
  // Use categoryScores if available, fallback to subScores float logic if not
  const getScoreData = (key: string, fallbackMax: number) => {
    if (categoryScores && categoryScores[key]) {
      const val = categoryScores[key].score;
      const max = categoryScores[key].max;
      return { val, max, pct: Math.max(0, Math.min(100, (val / max) * 100)) };
    }
    // Fallback to legacy subScores (e.g. 0.8)
    const rawVal = subScores?.[key] ?? 0;
    if (rawVal > 10) return { val: rawVal, max: 100, pct: Math.min(100, rawVal) };
    return { val: rawVal, max: 10, pct: Math.min(100, (rawVal / 10) * 100) };
  };

  const dimensions = [
    {
      key: 'work_experience',
      label: 'Work Experience',
      icon: <Briefcase className="w-4 h-4 text-indigo-400" />,
      data: getScoreData('work_experience', 35),
      color: 'bg-indigo-500',
    },
    {
      key: 'technical_skills',
      label: 'Technical Skills',
      icon: <Code className="w-4 h-4 text-sky-400" />,
      data: getScoreData('technical_skills', 35),
      color: 'bg-sky-500',
    },
    {
      key: 'education',
      label: 'Education',
      icon: <GraduationCap className="w-4 h-4 text-emerald-400" />,
      data: getScoreData('education', 15),
      color: 'bg-emerald-500',
    },
    {
      key: 'project_impact',
      label: 'Project Impact',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      data: getScoreData('project_impact', 15),
      color: 'bg-amber-500',
    },
  ];

  return (
    <LiquidGlassContainer glassOpacity={0.05} className="p-8 rounded-[32px] border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <span>⚡ Granular Sub-Score Breakdown</span>
          </h3>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            Multi-dimensional evaluation across core candidate qualifications
          </p>
        </div>
        <span className="hidden sm:inline-flex text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1 bg-secondary rounded-full border border-border">
          MAANG Rubric
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {dimensions.map((dim) => {
          const { val, max, pct } = dim.data;
          const badgeBg =
            pct >= 75
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : pct >= 50
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

          return (
            <div
              key={dim.key}
              className="bg-secondary/40 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md hover:border-primary/40"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5 font-bold text-foreground text-base">
                  <div className="p-2 rounded-xl bg-background/50 border border-border">{dim.icon}</div>
                  <span>{dim.label}</span>
                </div>
                <div className={`px-3 py-1 rounded-full border text-xs font-bold ${badgeBg}`}>
                  {val} / {max}
                </div>
              </div>

              {/* Granular Sub-score Progress Bar */}
              <div className="space-y-1.5 mt-4">
                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden p-0.5 border border-border">
                  <div
                    className={`h-full rounded-full ${dim.color} transition-all duration-1000 ease-out shadow-xs`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-medium text-muted-foreground px-1">
                  <span>Alignment Score</span>
                  <span>{pct.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </LiquidGlassContainer>
  );
};

export default SubScoresBreakdown;
