import { AppSettings, BEAD_THEMES, BeadThemeId } from '../types/tasbih';
import { X, Volume2, Mic, Smartphone, Palette, BellRing, Settings } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}: SettingsModalProps) {
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
            <Settings className="w-5 h-5 text-[#f6d186]" />
            <h2 className="text-lg font-semibold text-[#f6d186]">Preferences & Themes</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1">
          {/* Bead Theme Selection */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-white/80 uppercase tracking-wider mb-2.5">
              <Palette className="w-4 h-4 text-[#f6d186]" />
              Bead Material & Color
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BEAD_THEMES.map((theme) => {
                const isSelected = settings.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onUpdateSettings({ theme: theme.id as BeadThemeId })}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-white/15 border-[#f6d186] shadow-sm'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span 
                      className="w-5 h-5 rounded-full shadow-inner border border-white/20 shrink-0" 
                      style={{ backgroundColor: theme.primaryColor, boxShadow: `0 0 10px ${theme.primaryColor}` }}
                    />
                    <span className="text-xs font-medium text-white">{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound & Speech Toggles */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-white/80 uppercase tracking-wider mb-2.5">
              <Volume2 className="w-4 h-4 text-[#f6d186]" />
              Audio & Speech
            </label>
            <div className="space-y-2">
              {/* Master Audio */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <div className="text-xs font-medium text-white">Master Sound</div>
                  <div className="text-[11px] text-white/50">Enable or silence all sounds</div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ audioEnabled: !settings.audioEnabled })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    settings.audioEnabled ? 'bg-[#f6d186]' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-[#09061a] transition-transform ${
                    settings.audioEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Arabic Voice Recitation */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-start gap-2.5">
                  <Mic className="w-4 h-4 text-[#f6d186] mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-white">Male Arabic Recitation</div>
                    <div className="text-[11px] text-white/50">Speaks each dhikr aloud as you count</div>
                  </div>
                </div>
                <button
                  disabled={!settings.audioEnabled}
                  onClick={() => onUpdateSettings({ voiceRecitation: !settings.voiceRecitation })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    !settings.audioEnabled 
                      ? 'opacity-40 cursor-not-allowed bg-white/10' 
                      : settings.voiceRecitation ? 'bg-cyan-400' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-[#09061a] transition-transform ${
                    settings.voiceRecitation ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Bead Knock Sound */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-start gap-2.5">
                  <BellRing className="w-4 h-4 text-[#f6d186] mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-white">Subtle Bead Clack Sound</div>
                    <div className="text-[11px] text-white/50">Tactile acoustic prayer bead chime</div>
                  </div>
                </div>
                <button
                  disabled={!settings.audioEnabled}
                  onClick={() => onUpdateSettings({ chimeSound: !settings.chimeSound })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    !settings.audioEnabled 
                      ? 'opacity-40 cursor-not-allowed bg-white/10' 
                      : settings.chimeSound ? 'bg-[#f6d186]' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-[#09061a] transition-transform ${
                    settings.chimeSound ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Haptics */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-white/80 uppercase tracking-wider mb-2.5">
              <Smartphone className="w-4 h-4 text-[#f6d186]" />
              Tactile Vibration
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div>
                <div className="text-xs font-medium text-white">Haptic Vibration on Tap</div>
                <div className="text-[11px] text-white/50">Gentle physical vibration pulse</div>
              </div>
              <button
                onClick={() => onUpdateSettings({ hapticEnabled: !settings.hapticEnabled })}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  settings.hapticEnabled ? 'bg-emerald-400' : 'bg-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-[#09061a] transition-transform ${
                  settings.hapticEnabled ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full mt-2 py-2.5 rounded-2xl bg-gradient-to-r from-[#d4a753] to-[#f6d186] text-[#0b071e] font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}
