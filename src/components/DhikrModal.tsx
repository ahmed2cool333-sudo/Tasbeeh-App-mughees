import React, { useState } from 'react';
import { DhikrItem } from '../types/tasbih';
import { X, Plus, Search, Check, Sparkles, BookOpen } from 'lucide-react';

interface DhikrModalProps {
  isOpen: boolean;
  onClose: () => void;
  dhikrList: DhikrItem[];
  selectedIndex: number;
  onSelectDhikr: (index: number) => void;
  targetCount: number;
  onChangeTarget: (target: number) => void;
  autoSpeed: number;
  onChangeAutoSpeed: (speedMs: number) => void;
  onAddCustomDhikr: (item: DhikrItem) => void;
}

export function DhikrModal({
  isOpen,
  onClose,
  dhikrList,
  selectedIndex,
  onSelectDhikr,
  targetCount,
  onChangeTarget,
  autoSpeed,
  onChangeAutoSpeed,
  onAddCustomDhikr
}: DhikrModalProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'custom'>('library');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for adding custom dhikr
  const [customArabic, setCustomArabic] = useState('');
  const [customTransliteration, setCustomTransliteration] = useState('');
  const [customTranslation, setCustomTranslation] = useState('');
  const [customTarget, setCustomTarget] = useState(33);

  if (!isOpen) return null;

  const filteredDhikrs = dhikrList.filter(d => 
    d.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.arabic.includes(searchQuery)
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTransliteration.trim() && !customArabic.trim()) return;

    const newItem: DhikrItem = {
      id: `custom_${Date.now()}`,
      arabic: customArabic.trim() || customTransliteration.trim(),
      speechArabic: customArabic.trim() || customTransliteration.trim(),
      transliteration: customTransliteration.trim() || customArabic.trim(),
      translation: customTranslation.trim() || 'Custom Prayer',
      defaultTarget: customTarget,
      virtue: 'Custom personal supplication and remembrance.'
    };

    onAddCustomDhikr(newItem);
    setCustomArabic('');
    setCustomTransliteration('');
    setCustomTranslation('');
    setActiveTab('library');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
      <div 
        className="w-full max-w-md bg-gradient-to-b from-[#1b153b] via-[#120d2c] to-[#09061a] border border-[#f6d186]/30 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#f6d186]" />
            <h2 className="text-lg font-semibold text-[#f6d186]">Dhikr & Target Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white/5 p-1 rounded-2xl my-3 border border-white/5">
          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'library'
                ? 'bg-[#f6d186] text-[#0a071d] shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Adhkar Library ({dhikrList.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-[#f6d186] text-[#0a071d] shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom
          </button>
        </div>

        {/* Targets & Speed Bar */}
        <div className="bg-white/5 rounded-2xl p-3 mb-3 border border-white/10 space-y-2.5">
          <div>
            <label className="text-[11px] font-medium tracking-wide uppercase text-white/60 block mb-1.5">
              Cycle Goal / Target
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[33, 99, 100, 0].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChangeTarget(t)}
                  className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    targetCount === t
                      ? 'bg-[#f6d186] text-[#09061a] shadow-sm font-bold'
                      : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {t === 0 ? 'Free (∞)' : `${t}x`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium tracking-wide uppercase text-white/60 block mb-1.5">
              Auto-Recitation Speed
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '1.2s Fast', ms: 1200 },
                { label: '1.8s Calm', ms: 1800 },
                { label: '2.5s Peace', ms: 2500 },
                { label: '3.5s Meditative', ms: 3500 }
              ].map((s) => (
                <button
                  key={s.ms}
                  type="button"
                  onClick={() => onChangeAutoSpeed(s.ms)}
                  className={`py-1 rounded-xl text-[11px] font-medium transition-all ${
                    autoSpeed === s.ms
                      ? 'bg-cyan-400 text-[#09061a] font-bold shadow-sm'
                      : 'bg-white/5 text-white/75 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === 'library' ? (
          <>
            {/* Search Input */}
            <div className="relative mb-2.5">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search remembrance or translation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#f6d186]"
              />
            </div>

            {/* Dhikr Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredDhikrs.map((item, idx) => {
                const originalIndex = dhikrList.findIndex(d => d.id === item.id);
                const isSelected = originalIndex === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectDhikr(originalIndex);
                      onClose();
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-[#f6d186]/15 border-[#f6d186] shadow-md shadow-[#f6d186]/10'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#f6d186] text-[#09061a] flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                        <span className="font-semibold text-sm text-white">{item.transliteration}</span>
                      </div>
                      <span className="font-arabic text-xl text-[#f6d186] leading-none text-right">
                        {item.arabic}
                      </span>
                    </div>

                    <p className="text-xs text-white/70 line-clamp-1">{item.translation}</p>

                    {item.virtue && (
                      <div className="flex items-start gap-1.5 text-[11px] text-amber-200/80 bg-white/5 rounded-lg px-2 py-1">
                        <BookOpen className="w-3 h-3 shrink-0 mt-0.5 text-[#f6d186]" />
                        <span className="italic">{item.virtue}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Custom Dhikr Tab */
          <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
            <div>
              <label className="text-xs text-white/70 block mb-1">
                Arabic Script (optional)
              </label>
              <input
                type="text"
                dir="rtl"
                placeholder="سُبْحَانَ اللّٰهِ"
                value={customArabic}
                onChange={(e) => setCustomArabic(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-right font-arabic text-lg text-[#f6d186] placeholder-white/25 focus:outline-none focus:border-[#f6d186]"
              />
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">
                Transliteration / Title <span className="text-[#f6d186]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Rabbi Inni Lima Anzalta Ilayya"
                value={customTransliteration}
                onChange={(e) => setCustomTransliteration(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#f6d186]"
              />
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">
                English Meaning / Translation
              </label>
              <textarea
                rows={2}
                placeholder="e.g., My Lord, indeed I am in need of whatever good You would send down to me."
                value={customTranslation}
                onChange={(e) => setCustomTranslation(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#f6d186] resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">
                Custom Target Count
              </label>
              <div className="flex gap-2">
                {[33, 70, 100, 313, 1000].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCustomTarget(num)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold ${
                      customTarget === num
                        ? 'bg-[#f6d186] text-[#09061a]'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-[#d4a753] to-[#f6d186] text-[#0b071e] font-bold text-xs hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
            >
              Save to My Dhikr Library
            </button>
          </form>
        )}

        {/* Footer Done Button */}
        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 rounded-2xl bg-gradient-to-r from-[#d4a753] to-[#f6d186] text-[#0b071e] font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
}
