/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { CelestialSky } from './components/CelestialSky';
import { BeadStrand } from './components/BeadStrand';
import { DhikrModal } from './components/DhikrModal';
import { StatsModal } from './components/StatsModal';
import { SettingsModal } from './components/SettingsModal';
import { CompletionModal } from './components/CompletionModal';
import { DhikrItem, DhikrStats, AppSettings } from './types/tasbih';
import {
  loadSavedStats,
  saveStats,
  loadSavedSettings,
  saveSettings,
  loadSavedDhikrList,
  saveDhikrList
} from './utils/dhikrData';
import {
  initAudioContext,
  playBeadChime,
  speakArabicText,
  playCompletionHarmonics,
  triggerHapticVibration
} from './utils/audio';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  BarChart2,
  Settings,
  Menu,
  Maximize2,
  Minimize2
} from 'lucide-react';

const CIRCLE_RADIUS = 48;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export default function App() {
  const [dhikrList, setDhikrList] = useState<DhikrItem[]>(() => loadSavedDhikrList());
  const [currentDhikrIndex, setCurrentDhikrIndex] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [targetCount, setTargetCount] = useState<number>(33);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings>(() => loadSavedSettings());
  const [stats, setStats] = useState<DhikrStats>(() => loadSavedStats());
  const [zenMode, setZenMode] = useState<boolean>(false);

  // Modals state
  const [isDhikrModalOpen, setIsDhikrModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countRef = useRef<number>(count);
  countRef.current = count;

  const currentDhikr = dhikrList[currentDhikrIndex] || dhikrList[0];

  // Save persistent state
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  useEffect(() => {
    saveDhikrList(dhikrList);
  }, [dhikrList]);

  // Synchronize target with dhikr default when switching
  const handleSelectDhikr = (index: number) => {
    setCurrentDhikrIndex(index);
    const chosen = dhikrList[index];
    if (chosen?.defaultTarget) {
      setTargetCount(chosen.defaultTarget);
    }
    setCount(0);
    stopAutoPlay();
    // Speak on initial selection if voice is enabled
    if (settings.audioEnabled && settings.voiceRecitation) {
      speakArabicText(chosen.speechArabic || chosen.arabic, true);
    }
  };

  const handleIncrement = useCallback(() => {
    initAudioContext();

    // 1. Audio and Haptic feedback
    if (settings.audioEnabled && settings.chimeSound) {
      playBeadChime(true);
    }
    if (settings.audioEnabled && settings.voiceRecitation) {
      speakArabicText(currentDhikr.speechArabic || currentDhikr.arabic, true);
    }
    if (settings.hapticEnabled) {
      triggerHapticVibration(settings.vibrateDuration, true);
    }

    setCount(prev => {
      const next = prev + 1;

      // Update statistics
      setStats(prevStats => {
        const dhikrId = currentDhikr.id;
        const currentCountForId = prevStats.countsById[dhikrId] || 0;
        return {
          ...prevStats,
          todayCount: prevStats.todayCount + 1,
          totalLifetimeCount: prevStats.totalLifetimeCount + 1,
          countsById: {
            ...prevStats.countsById,
            [dhikrId]: currentCountForId + 1
          }
        };
      });

      // Target reached check
      if (targetCount > 0 && next >= targetCount) {
        // Complete cycle
        stopAutoPlay();
        playCompletionHarmonics(settings.audioEnabled);
        setStats(prevStats => ({
          ...prevStats,
          completedCycles: prevStats.completedCycles + 1
        }));
        setTimeout(() => {
          setIsCompletionModalOpen(true);
        }, 350);
        return targetCount;
      }

      return next;
    });
  }, [settings, currentDhikr, targetCount]);

  const handleDecrement = useCallback(() => {
    initAudioContext();
    setCount(prev => Math.max(0, prev - 1));
    if (settings.hapticEnabled) {
      triggerHapticVibration(15, true);
    }
  }, [settings]);

  const handleReset = () => {
    stopAutoPlay();
    setCount(0);
  };

  const startAutoPlay = () => {
    initAudioContext();
    if (targetCount > 0 && countRef.current >= targetCount) {
      setCount(0);
    }
    setIsAutoPlaying(true);
    handleIncrement();

    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    autoPlayTimerRef.current = setInterval(() => {
      if (targetCount > 0 && countRef.current >= targetCount - 1) {
        handleIncrement();
        stopAutoPlay();
      } else {
        handleIncrement();
      }
    }, settings.autoSpeed);
  };

  const stopAutoPlay = () => {
    setIsAutoPlaying(false);
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  };

  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  };

  // Keyboard shortcut support: Spacebar or Enter to count
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleIncrement();
      } else if (e.code === 'ArrowLeft' || e.code === 'ArrowDown') {
        e.preventDefault();
        handleDecrement();
      } else if (e.key === 'r' || e.key === 'R') {
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleIncrement, handleDecrement]);

  // Cleanup auto-timer on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, []);

  // Compute stroke offset for circular progress bar
  const progressRatio = targetCount > 0 ? Math.min(1, count / targetCount) : 0;
  const strokeOffset = CIRCLE_CIRCUMFERENCE - progressRatio * CIRCLE_CIRCUMFERENCE;

  return (
    <div className="w-full min-h-screen min-h-[100dvh] bg-[#030209] flex items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* App Mobile Frame Viewport */}
      <div className="relative w-full max-w-[440px] h-[100dvh] sm:h-[94vh] sm:max-h-[920px] bg-gradient-to-b from-[#20134a] via-[#0d0a26] to-[#050311] overflow-hidden flex flex-col justify-between sm:rounded-[40px] sm:border sm:border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
        
        {/* Dynamic Celestial Stars & Fireflies Canvas */}
        <CelestialSky />

        {/* Golden Glowing Crescent Moon */}
        <div 
          className="absolute top-10 left-9 w-14 h-14 rounded-full pointer-events-none z-[2] transition-opacity duration-300"
          style={{
            boxShadow: '-10px 8px 0 2px #f2f7ff',
            filter: 'drop-shadow(0 0 16px rgba(230, 243, 255, 0.85)) drop-shadow(0 0 35px rgba(162, 206, 255, 0.45))',
            transform: 'rotate(-15deg)',
            opacity: zenMode ? 0.35 : 1
          }}
        />

        {/* Top Header Controls */}
        <header className={`relative z-20 flex items-center justify-between px-6 pt-5 pb-2 transition-all duration-300 ${zenMode ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
          <div className="flex items-center gap-2">
            {/* Dhikr Selector Button */}
            <button
              onClick={() => setIsDhikrModalOpen(true)}
              className="bg-white/10 backdrop-blur-md border border-white/15 text-[#ecd9b5] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg active:scale-95 hover:bg-white/15 transition-all"
              aria-label="Select Dhikr"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Dhikr</span>
            </button>

            {/* Statistics Button */}
            <button
              onClick={() => setIsStatsModalOpen(true)}
              className="bg-white/10 backdrop-blur-md border border-white/15 text-[#ecd9b5] p-1.5 rounded-full shadow-lg active:scale-95 hover:bg-white/15 transition-all"
              title="Daily and Lifetime Statistics"
              aria-label="Statistics"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Zen Mode Toggle */}
            <button
              onClick={() => setZenMode(prev => !prev)}
              className="bg-white/10 backdrop-blur-md border border-white/15 text-[#ecd9b5] p-1.5 rounded-full shadow-lg active:scale-95 hover:bg-white/15 transition-all"
              title={zenMode ? 'Exit Zen Mode' : 'Enter Zen Focus Mode'}
              aria-label="Toggle Zen Focus"
            >
              {zenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="bg-white/10 backdrop-blur-md border border-white/15 text-[#ecd9b5] p-1.5 rounded-full shadow-lg active:scale-95 hover:bg-white/15 transition-all"
              title="Audio and Themes"
              aria-label="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {/* Reset Counter Button */}
            <button
              onClick={handleReset}
              className="bg-white/10 backdrop-blur-md border border-white/15 text-[#ecd9b5] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg active:scale-95 hover:bg-white/15 transition-all"
              aria-label="Reset counter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </header>

        {/* Central Dhikr Typography Display */}
        <main 
          onClick={handleIncrement}
          className="relative z-10 text-center px-6 -mt-2 flex flex-col items-center cursor-pointer select-none active:scale-[0.99] transition-transform"
        >
          {/* Calligraphic Arabic Script */}
          <div 
            dir="rtl"
            className="font-arabic text-4xl sm:text-5xl leading-tight text-[#fff9ea] transition-all duration-300 drop-shadow-[0_0_24px_rgba(255,228,160,0.7)]"
          >
            {currentDhikr.arabic}
          </div>

          {/* Golden Diamond Divider */}
          <div className="w-2 h-2 bg-[#f6d186] rotate-45 my-2.5 shadow-[0_0_10px_#f6d186]" />

          {/* Transliteration */}
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-white drop-shadow-sm">
            {currentDhikr.transliteration}
          </h1>

          {/* Translation */}
          <p className="text-xs sm:text-sm font-light text-[#b5bbd6] mt-0.5 max-w-xs">
            {currentDhikr.translation}
          </p>
        </main>

        {/* Mid Playback & Audio Controls */}
        <section className={`relative z-20 flex flex-col items-center gap-2 transition-all duration-300 ${zenMode ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}>
          {/* Sound Mute/Unmute */}
          <button
            onClick={() => setSettings(s => ({ ...s, audioEnabled: !s.audioEnabled }))}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-md active:scale-90 ${
              settings.audioEnabled 
                ? 'bg-white/10 border-white/20 text-[#f6d186]' 
                : 'bg-white/5 border-white/10 text-white/30'
            }`}
            title={settings.audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
            aria-label="Sound Toggle"
          >
            {settings.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Auto-Dhikr Play/Pause Large Button */}
          <button
            onClick={toggleAutoPlay}
            className={`w-14 h-14 rounded-full border flex items-center justify-center transition-transform active:scale-95 shadow-[0_10px_28px_rgba(0,0,0,0.5),0_0_20px_rgba(246,209,134,0.2)] ${
              isAutoPlaying
                ? 'bg-gradient-to-br from-amber-400/40 to-yellow-600/60 border-[#f6d186] text-amber-200'
                : 'bg-radial from-white/25 to-[#14102d]/80 border-amber-200/40 text-[#f6d186]'
            }`}
            title={isAutoPlaying ? 'Pause Auto Dhikr' : 'Start Auto Dhikr'}
            aria-label="Auto Dhikr"
          >
            {isAutoPlaying ? (
              <Pause className="w-5 h-5 fill-current text-[#f6d186]" />
            ) : (
              <Play className="w-5 h-5 fill-current text-[#f6d186] ml-0.5" />
            )}
          </button>
        </section>

        {/* Sliding Prayer Beads Wire (Bezier SVG with Interactive Touch & Physics) */}
        <BeadStrand
          count={count}
          theme={settings.theme}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
        />

        {/* Circular Progress Ring & Interactive Counter */}
        <div className="relative z-20 flex flex-col items-center mb-2">
          <div 
            onClick={handleIncrement}
            className="relative w-28 h-28 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            title="Tap to count"
          >
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 110 110">
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fcedb4" />
                  <stop offset="50%" stopColor="#f6d186" />
                  <stop offset="100%" stopColor="#bd8933" />
                </linearGradient>
              </defs>

              {/* Background Ring */}
              <circle
                cx="55"
                cy="55"
                r={CIRCLE_RADIUS}
                className="fill-[#0e0b21]/70 stroke-white/10 stroke-[5]"
              />

              {/* Animated Progress Ring */}
              <circle
                cx="55"
                cy="55"
                r={CIRCLE_RADIUS}
                className="fill-none stroke-[5.5] stroke-linecap-round transition-[stroke-dashoffset] duration-300"
                style={{
                  stroke: 'url(#goldGradient)',
                  strokeDasharray: CIRCLE_CIRCUMFERENCE,
                  strokeDashoffset: targetCount > 0 ? strokeOffset : 0,
                  filter: 'drop-shadow(0 0 8px rgba(246, 209, 134, 0.65))'
                }}
              />
            </svg>

            {/* Inner Count Display */}
            <div className="relative z-10 text-center select-none">
              <div className="text-3xl font-extrabold text-[#fff8e8] leading-none drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                {count}
              </div>
              <div className="text-xs font-semibold text-[#8c90ad] mt-1">
                {targetCount > 0 ? `/ ${targetCount}` : '∞ Free'}
              </div>
            </div>
          </div>
        </div>

        {/* Night Desert Oasis Silhouette Backdrop */}
        <div className="absolute bottom-0 left-0 w-full h-[36%] pointer-events-none z-[4] overflow-hidden">
          <svg className="w-full h-full absolute bottom-0 left-0" viewBox="0 0 440 280" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waterGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#19375e" />
                <stop offset="40%" stopColor="#0f2647" />
                <stop offset="100%" stopColor="#061226" />
              </linearGradient>
              <linearGradient id="duneFar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#181335" />
                <stop offset="100%" stopColor="#0c091f" />
              </linearGradient>
              <linearGradient id="duneNear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#120d29" />
                <stop offset="100%" stopColor="#060410" />
              </linearGradient>
            </defs>

            {/* Far Rolling Dunes */}
            <path d="M -20,110 Q 70,55 160,95 T 320,80 T 460,110 L 460,280 L -20,280 Z" fill="url(#duneFar)" opacity="0.6" />
            <path d="M -20,135 Q 110,95 240,140 T 460,125 L 460,280 L -20,280 Z" fill="url(#duneFar)" />

            {/* Shimmering Oasis Waters */}
            <ellipse cx="230" cy="225" rx="145" ry="38" fill="url(#waterGrad)" />
            <ellipse cx="230" cy="225" rx="110" ry="24" fill="#204d80" opacity="0.35" filter="blur(6px)" />
            
            <path d="M 140,220 C 180,217 280,217 320,220" stroke="rgba(246, 209, 134, 0.35)" strokeWidth="1.2" fill="none" opacity="0.8" />
            <path d="M 170,230 C 200,228 260,228 290,230" stroke="rgba(246, 209, 134, 0.25)" strokeWidth="1" fill="none" />
            
            {/* Near Sand Dunes */}
            <path d="M -20,185 Q 130,170 200,205 T 460,180 L 460,280 L -20,280 Z" fill="url(#duneNear)" />

            {/* Palm Silhouettes */}
            <g fill="#070512">
              <path d="M 30,280 Q 32,210 24,185 Q 26,210 33,280 Z" />
              <path d="M 24,185 Q 5,175 -8,185 Q 10,182 24,185 Z" />
              <path d="M 24,185 Q 15,160 5,165 Q 18,172 24,185 Z" />
              <path d="M 24,185 Q 32,158 45,168 Q 33,172 24,185 Z" />
              <path d="M 24,185 Q 40,180 50,195 Q 35,188 24,185 Z" />
              
              <path d="M 320,280 Q 323,195 310,165 Q 315,195 324,280 Z" />
              <path d="M 310,165 Q 280,150 260,165 Q 285,160 310,165 Z" />
              <path d="M 310,165 Q 295,135 285,142 Q 302,150 310,165 Z" />
              <path d="M 310,165 Q 325,130 345,140 Q 328,150 310,165 Z" />
              <path d="M 310,165 Q 335,152 355,172 Q 330,165 310,165 Z" />

              <path d="M 390,280 Q 394,215 390,190 Q 392,215 394,280 Z" />
              <path d="M 390,190 Q 365,180 350,190 Q 370,185 390,190 Z" />
              <path d="M 390,190 Q 380,165 372,170 Q 385,178 390,190 Z" />
              <path d="M 390,190 Q 405,165 420,175 Q 405,182 390,190 Z" />
              <path d="M 390,190 Q 412,185 425,200 Q 405,193 390,190 Z" />
            </g>
          </svg>
        </div>

        {/* Modals */}
        <DhikrModal
          isOpen={isDhikrModalOpen}
          onClose={() => setIsDhikrModalOpen(false)}
          dhikrList={dhikrList}
          selectedIndex={currentDhikrIndex}
          onSelectDhikr={handleSelectDhikr}
          targetCount={targetCount}
          onChangeTarget={(newTarget) => setTargetCount(newTarget)}
          autoSpeed={settings.autoSpeed}
          onChangeAutoSpeed={(newSpeed) => setSettings(s => ({ ...s, autoSpeed: newSpeed }))}
          onAddCustomDhikr={(newItem) => {
            setDhikrList(prev => [...prev, newItem]);
            setCurrentDhikrIndex(dhikrList.length);
            setCount(0);
          }}
        />

        <StatsModal
          isOpen={isStatsModalOpen}
          onClose={() => setIsStatsModalOpen(false)}
          stats={stats}
          dhikrList={dhikrList}
          onResetStats={() => {
            const today = new Date().toISOString().split('T')[0];
            const emptyStats: DhikrStats = {
              todayDate: today,
              todayCount: 0,
              totalLifetimeCount: 0,
              completedCycles: 0,
              countsById: {}
            };
            setStats(emptyStats);
          }}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={settings}
          onUpdateSettings={(newVals) => setSettings(s => ({ ...s, ...newVals }))}
        />

        <CompletionModal
          isOpen={isCompletionModalOpen}
          onClose={() => setIsCompletionModalOpen(false)}
          targetCount={targetCount}
          currentDhikr={currentDhikr}
          onRestartCycle={() => {
            setIsCompletionModalOpen(false);
            setCount(0);
          }}
          onOpenDhikrMenu={() => {
            setIsCompletionModalOpen(false);
            setIsDhikrModalOpen(true);
          }}
        />
      </div>
    </div>
  );
}
