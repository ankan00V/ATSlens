import React from 'react';
import { AlertTriangle, Lightbulb, XCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { LiquidGlassContainer } from './ui/LiquidGlassContainer';

interface TechStackRecommendationsProps {
  missingTechStack?: string[];
  skillRecommendations?: string[];
}

export const TechStackRecommendations: React.FC<TechStackRecommendationsProps> = ({
  missingTechStack = [],
  skillRecommendations = [],
}) => {
  const hasMissingTech = missingTechStack && missingTechStack.length > 0;
  const hasRecommendations = skillRecommendations && skillRecommendations.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Missing Tech Stack Section (Rose Badges or Positive Empty State) */}
      <LiquidGlassContainer glassOpacity={0.2} className="p-8 rounded-[32px] border border-white/60">
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-2 rounded-xl ${hasMissingTech ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {hasMissingTech ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Missing Tech Stack</h3>
            <p className="text-xs font-medium text-slate-500">Target role stack requirements missing from resume</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-2">
          {hasMissingTech ? (
            missingTechStack.map((tech, idx) => (
              <span
                key={idx}
                className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100/80 transition-colors px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-2xs flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{tech}</span>
              </span>
            ))
          ) : (
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-2xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>All required tech stack matched!</span>
            </span>
          )}
        </div>
      </LiquidGlassContainer>

      {/* Skill Recommendations Section (Sky & Amber Badges or Positive Empty State) */}
      <LiquidGlassContainer glassOpacity={0.2} className="p-8 rounded-[32px] border border-white/60">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Skill & Profile Recommendations</h3>
            <p className="text-xs font-medium text-slate-500">Actionable enhancements to reach 95%+ match score</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-2">
          {hasRecommendations ? (
            skillRecommendations.map((rec, idx) => {
              const isSky = idx % 2 === 0;
              const badgeStyle = isSky
                ? 'bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100/80'
                : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100/80';
              const iconStyle = isSky ? 'text-sky-600' : 'text-amber-600';

              return (
                <span
                  key={idx}
                  className={`border transition-colors px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-2xs flex items-center gap-1.5 ${badgeStyle}`}
                >
                  <ArrowUpRight className={`w-3.5 h-3.5 shrink-0 ${iconStyle}`} />
                  <span>{rec}</span>
                </span>
              );
            })
          ) : (
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-2xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Profile fully optimized for target role requirements</span>
            </span>
          )}
        </div>
      </LiquidGlassContainer>
    </div>
  );
};

export default TechStackRecommendations;

