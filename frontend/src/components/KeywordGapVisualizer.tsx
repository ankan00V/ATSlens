import React from 'react';
import { CheckCircle2, XCircle, Tag, Scale } from 'lucide-react';
import { LiquidGlassContainer } from './ui/LiquidGlassContainer';

export interface KeywordGapData {
  matched_keywords?: string[];
  missing_keywords?: string[];
}

interface KeywordGapVisualizerProps {
  keywordGap?: KeywordGapData;
}

export const KeywordGapVisualizer: React.FC<KeywordGapVisualizerProps> = ({ keywordGap }) => {
  const matched = keywordGap?.matched_keywords ?? [];
  const missing = keywordGap?.missing_keywords ?? [];

  const total = matched.length + missing.length;
  const matchPct = total > 0 ? Math.round((matched.length / total) * 100) : 100;

  return (
    <LiquidGlassContainer glassOpacity={0.2} className="p-8 rounded-[32px] border border-white/60">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-slate-700" />
            <span>Keyword Gap Analysis</span>
          </h3>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Semantic match of candidate skills vs target ATS requirements
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md border border-slate-200/80 px-4 py-2 rounded-2xl shadow-xs">
          <Scale className="w-4 h-4 text-slate-600" />
          <span className="text-xs font-semibold text-slate-600">Keyword Density Match:</span>
          <span className="text-sm font-black text-slate-900">{matchPct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Keywords Box */}
        <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Matched Keywords ({matched.length})</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              Found in Resume
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {matched.length > 0 ? (
              matched.map((kw, i) => (
                <span
                  key={i}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:bg-emerald-100/70 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{kw}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 font-medium italic">No matched keywords found</span>
            )}
          </div>
        </div>

        {/* Missing Keywords Box */}
        <div className={`border rounded-2xl p-5 shadow-xs ${missing.length > 0 ? 'bg-rose-50/40 border-rose-200/80' : 'bg-emerald-50/40 border-emerald-200/80'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center gap-2 font-bold text-sm uppercase tracking-wider ${missing.length > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
              {missing.length > 0 ? <XCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              <span>Missing Keywords ({missing.length})</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${missing.length > 0 ? 'text-rose-700 bg-rose-100/80' : 'text-emerald-700 bg-emerald-100/80'}`}>
              {missing.length > 0 ? 'Action Required' : 'All Matched'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {missing.length > 0 ? (
              missing.map((kw, i) => (
                <span
                  key={i}
                  className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:bg-rose-100/70 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>{kw}</span>
                </span>
              ))
            ) : (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>No missing keywords</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </LiquidGlassContainer>
  );
};

export default KeywordGapVisualizer;

