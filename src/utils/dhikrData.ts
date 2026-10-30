import { DhikrItem, DhikrStats, AppSettings, BEAD_THEMES } from '../types/tasbih';

export const DEFAULT_DHIKR_ITEMS: DhikrItem[] = [
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلّٰهِ',
    speechArabic: 'اَلْحَمْدُ لِلَّٰهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is due to Allah',
    defaultTarget: 33,
    virtue: 'Fills the scale of good deeds with light and gratitude.'
  },
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللّٰهِ',
    speechArabic: 'سُبْحَانَ اللَّٰهِ',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah',
    defaultTarget: 33,
    virtue: 'Purifies the heart and removes ten sins with each utterance.'
  },
  {
    id: 'allahuakbar',
    arabic: 'اللّٰهُ أَكْبَرُ',
    speechArabic: 'اَللَّٰهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    defaultTarget: 33,
    virtue: 'Plants a fruitful tree in Jannah and proclaims divine majesty.'
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللّٰهَ',
    speechArabic: 'أَسْتَغْفِرُ اللَّٰهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    defaultTarget: 100,
    virtue: 'Opens the doors of sustenance, relief, and peace of mind.'
  },
  {
    id: 'la_ilaha_illallah',
    arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ',
    speechArabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ',
    transliteration: 'La ilaha illallah',
    translation: 'There is no deity worthy of worship except Allah',
    defaultTarget: 100,
    virtue: 'The supreme foundation of faith and the key to Paradise.'
  },
  {
    id: 'subhanallahi_wa_bihamdihi',
    arabic: 'سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ',
    speechArabic: 'سُبْحَانَ اللَّٰهِ وَبِحَمْدِهِ',
    transliteration: 'SubhanAllahi wa bihamdihi',
    translation: 'Glory be to Allah and Praise be to Him',
    defaultTarget: 100,
    virtue: 'Whoever recites this 100 times daily, their sins are forgiven even if like the foam of the sea.'
  },
  {
    id: 'subhanallahil_azeem',
    arabic: 'سُبْحَانَ اللّٰهِ الْعَظِيمِ',
    speechArabic: 'سُبْحَانَ اللَّٰهِ الْعَظِيمِ',
    transliteration: 'SubhanAllahil Azeem',
    translation: 'Glory be to Allah the Almighty',
    defaultTarget: 33,
    virtue: 'Beloved to Ar-Rahman, light on the tongue, heavy on the Scales.'
  },
  {
    id: 'la_hawla',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ',
    speechArabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّٰهِ',
    transliteration: 'La hawla wa la quwwata illa billah',
    translation: 'There is no power nor strength except with Allah',
    defaultTarget: 33,
    virtue: 'One of the precious treasures beneath the Throne of Allah.'
  },
  {
    id: 'salawat',
    arabic: 'اللّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    speechArabic: 'اَللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    transliteration: 'Allahumma salli \'ala Muhammad',
    translation: 'O Allah, send blessings upon Muhammad',
    defaultTarget: 100,
    virtue: 'Whoever sends one salutation upon the Prophet, Allah sends ten blessings upon them.'
  },
  {
    id: 'hasbunallah',
    arabic: 'حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيلُ',
    speechArabic: 'حَسْبُنَا اللَّٰهُ وَنِعْمَ الْوَكِيلُ',
    transliteration: 'Hasbunallahu wa ni\'mal wakeel',
    translation: 'Allah is sufficient for us, and He is the best Disposer',
    defaultTarget: 33,
    virtue: 'Recited by Prophet Ibrahim in the fire and by the Sahabah in trials.'
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  audioEnabled: true,
  voiceRecitation: true,
  chimeSound: true,
  hapticEnabled: true,
  autoSpeed: 2000,
  theme: 'turquoise',
  vibrateDuration: 25
};


function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function loadSavedStats(): DhikrStats {
  const today = getTodayString();
  try {
    const raw = localStorage.getItem('tasbih_stats_v2');
    if (raw) {
      const parsed = JSON.parse(raw) as DhikrStats;
      if (parsed.todayDate !== today) {
        // Reset daily counter while keeping total lifetime and history
        parsed.todayDate = today;
        parsed.todayCount = 0;
      }
      return parsed;
    }
  } catch {
    // Ignore error
  }
  return {
    todayDate: today,
    todayCount: 0,
    totalLifetimeCount: 0,
    completedCycles: 0,
    countsById: {}
  };
}

export function saveStats(stats: DhikrStats): void {
  try {
    localStorage.setItem('tasbih_stats_v2', JSON.stringify(stats));
  } catch {
    // Ignore error
  }
}

export function loadSavedSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('tasbih_settings_v2');
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore error
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem('tasbih_settings_v2', JSON.stringify(settings));
  } catch {
    // Ignore error
  }
}

export function loadSavedDhikrList(): DhikrItem[] {
  try {
    const raw = localStorage.getItem('tasbih_custom_dhikr_list');
    if (raw) {
      const parsed = JSON.parse(raw) as DhikrItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore
  }
  return DEFAULT_DHIKR_ITEMS;
}

export function saveDhikrList(list: DhikrItem[]): void {
  try {
    localStorage.setItem('tasbih_custom_dhikr_list', JSON.stringify(list));
  } catch {
    // Ignore
  }
}
