export interface DhikrItem {
  id: string;
  arabic: string;
  speechArabic: string;
  transliteration: string;
  translation: string;
  defaultTarget?: number;
  virtue?: string;
}

export interface DhikrStats {
  todayDate: string;
  todayCount: number;
  totalLifetimeCount: number;
  completedCycles: number;
  countsById: Record<string, number>;
}

export type BeadThemeId = 'turquoise' | 'emerald' | 'amber' | 'sapphire';

export interface BeadTheme {
  id: BeadThemeId;
  name: string;
  primaryColor: string;
  glowColor: string;
  gradientStopStart: string;
  gradientStopEnd: string;
}

export const BEAD_THEMES: BeadTheme[] = [
  {
    id: 'turquoise',
    name: 'Persian Turquoise',
    primaryColor: '#2ee6d6',
    glowColor: 'rgba(46, 230, 214, 0.65)',
    gradientStopStart: '#d4fffb',
    gradientStopEnd: '#053e39'
  },
  {
    id: 'emerald',
    name: 'Imperial Emerald',
    primaryColor: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.65)',
    gradientStopStart: '#bbf7d0',
    gradientStopEnd: '#064e3b'
  },
  {
    id: 'amber',
    name: 'Royal Amber',
    primaryColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    gradientStopStart: '#fef3c7',
    gradientStopEnd: '#78350f'
  },
  {
    id: 'sapphire',
    name: 'Celestial Sapphire',
    primaryColor: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.65)',
    gradientStopStart: '#dbeafe',
    gradientStopEnd: '#1e3a8a'
  }
];

export interface AppSettings {
  audioEnabled: boolean;
  voiceRecitation: boolean;
  chimeSound: boolean;
  hapticEnabled: boolean;
  autoSpeed: number; // in milliseconds
  theme: BeadThemeId;
  vibrateDuration: number;
}
