import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { DhikrItem } from '../types/tasbih';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCount: number;
  currentDhikr: DhikrItem;
  onRestartCycle: () => void;
  onOpenDhikrMenu: () => void;
}

export function CompletionModal({
  isOpen,
  targetCount,
  currentDhikr,
  onRestartCycle,
  onOpenDhikrMenu
}: CompletionModalProps) {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#f6d186', '#2ee6d6', '#ffffff', '#eab308']
        });
      } catch {
        // Ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-sm bg-gradient-to-b from-[#25184f] via-[#140e34] to-[#0a071d] border border-[#f6d186]/40 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f6d186]/30 to-[#2ee6d6]/20 border border-[#f6d186]/50 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(246,209,134,0.4)]">
          ✨
        </div>

        <h2 className="text-2xl font-bold text-[#f6d186] font-arabic mt-1">
          مَا شَاءَ اللّٰهُ تَبَارَكَ اللّٰهُ
        </h2>

        <h3 className="text-xl font-bold text-white -mt-1">
          Alhamdulillah!
        </h3>

        <p className="text-xs text-white/80 leading-relaxed max-w-xs">
          You have completed a cycle of <span className="font-bold text-[#f6d186]">{targetCount} counts</span> of <span className="text-cyan-300 font-semibold">{currentDhikr.transliteration}</span>.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-amber-200/90 italic my-1">
          "May Allah accept your dhikr, forgive your shortcomings, and grant tranquility to your heart."
        </div>

        <div className="w-full flex flex-col gap-2 mt-2">
          <button
            onClick={onRestartCycle}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#d4a753] to-[#f6d186] text-[#0b071e] font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Start Next Cycle
          </button>

          <button
            onClick={onOpenDhikrMenu}
            className="w-full py-2.5 rounded-2xl bg-white/5 border border-white/15 text-white/90 font-medium text-xs hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <span>Choose Another Dhikr</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#f6d186]" />
          </button>
        </div>
      </div>
    </div>
  );
}
