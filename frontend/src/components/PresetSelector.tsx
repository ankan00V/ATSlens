import React from 'react';
import { PRESET_RESUMES, type PresetResume } from '../data/presetResumes';
import { Sparkles, Building2, Code2, GraduationCap, CheckCircle2 } from 'lucide-react';

interface PresetSelectorProps {
  activePresetId: string | null;
  onSelectPreset: (preset: PresetResume) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ activePresetId, onSelectPreset }) => {
  const getPresetIcon = (id: string) => {
    switch (id) {
      case 'google-senior-frontend':
        return <Code2 className="w-4 h-4 text-sky-600" />;
      case 'meta-backend':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case 'ai-research-intern':
        return <GraduationCap className="w-4 h-4 text-emerald-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="mb-6 space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Interactive Demo Presets</span>
        </label>
        <span className="text-[11px] font-semibold text-slate-500">Instant One-Click Load</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {PRESET_RESUMES.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`group relative text-left p-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                  : 'bg-white/70 hover:bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5 font-bold text-xs truncate">
                  <span className={isActive ? 'text-white' : ''}>{getPresetIcon(preset.id)}</span>
                  <span className="truncate">{preset.title}</span>
                </div>
                {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
              </div>
              <p className={`text-[11px] leading-tight line-clamp-1 font-medium ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                {preset.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PresetSelector;
