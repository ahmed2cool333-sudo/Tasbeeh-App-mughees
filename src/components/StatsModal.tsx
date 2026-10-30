import { DhikrStats, DhikrItem } from '../types/tasbih';
import { X, Award, Flame, RotateCcw } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DhikrStats;
  dhikrList: DhikrItem[];
  onResetStats: () => void;
}

export function StatsModal({
  isOpen,
  onClose,
  stats,
  dhikrList,
  onResetStats
}: StatsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-md bg-gradient-to-b from-[#1b153b] via-[#120d2c] to-[#09061a] border border-[#f6d186]/30 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#f6d186]" />
            <h2 className="text-lg font-semibold text-[#f6d186]">Dhikr Journey & Stats</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[11px] text-white/60 block uppercase font-medium">Today</span>
            <span className="text-2xl font-bold text-[#f6d186]">{stats.todayCount}</span>
            <span className="text-[10px] text-white/40 block mt-0.5">Recitations</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[11px] text-white/60 block uppercase font-medium">Lifetime</span>
            <span className="text-2xl font-bold text-cyan-300">{stats.totalLifetimeCount}</span>
            <span className="text-[10px] text-white/40 block mt-0.5">Total Beads</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[11px] text-white/60 block uppercase font-medium">Completed</span>
            <span className="text-2xl font-bold text-emerald-400">{stats.completedCycles}</span>
            <span className="text-[10px] text-white/40 block mt-0.5">Full Cycles</span>
          </div>
        </div>

        {/* Spiritual Encouragement Note */}
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-2xl p-3 mb-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0 text-[#f6d186]">
            <Flame className="w-4 h-4" />
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            "Keep your tongue moist with the remembrance of Allah." — Prophet Muhammad ﷺ (Tirmidhi)
          </p>
        </div>

        {/* Breakdown by Dhikr */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-1">
            Recitations by Supplication
          </h3>

          {dhikrList.map((item) => {
            const count = stats.countsById[item.id] || 0;
            return (
              <div 
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5"
              >
                <div>
                  <div className="text-xs font-medium text-white">{item.transliteration}</div>
                  <div className="text-[10px] text-white/50 line-clamp-1">{item.translation}</div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#f6d186]">{count}</span>
                  <span className="text-[10px] text-white/40 block">counts</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4 pt-2 border-t border-white/10">
          <button
            onClick={() => {
              if (window.confirm('Reset all dhikr statistics to 0?')) {
                onResetStats();
              }
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#d4a753] to-[#f6d186] text-[#0b071e] font-bold text-xs hover:brightness-110 active:scale-[0.98] transition-all shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
