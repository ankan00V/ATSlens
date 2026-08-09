import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenAssessment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAssessment }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 lg:px-16 py-5 font-sora backdrop-blur-sm bg-black/20 border-b border-white/5">
      {/* Left Logo & Tagline */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <span className="text-foreground text-xl md:text-2xl font-bold tracking-tight uppercase">
          ATSlens <span className="text-primary">AI</span>
        </span>
      </div>

      {/* Right Action Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenAssessment}
          className="text-primary-foreground bg-primary hover:brightness-110 active:scale-[0.97] transition-all rounded-md uppercase text-xs tracking-widest px-5 py-2.5 md:px-6 md:py-3 font-bold cursor-pointer shadow-lg shadow-primary/25 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Run AI Assessment</span>
        </button>
      </div>
    </nav>
  );
};
