let audioCtx: AudioContext | null = null;
let selectedMaleVoice: SpeechSynthesisVoice | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function initAudioContext(): void {
  try {
    getAudioContext();
  } catch {
    // Ignore audio initialization error in restricted environments
  }
}

export function selectBestMaleArabicVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const maleVoiceKeywords = ['maged', 'tarik', 'tariq', 'naif', 'majed', 'hamed', 'youssef', 'male', 'david', 'george', 'hassan', 'omar'];
  const femaleVoiceKeywords = ['female', 'laila', 'mariam', 'salma', 'zeina', 'zariyah', 'samantha', 'victoria', 'karen'];

  // 1. Try finding Arabic voice that is male
  let candidate = voices.find(v => {
    const lang = (v.lang || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    const isArabic = lang.startsWith('ar');
    const isMale = maleVoiceKeywords.some(m => name.includes(m)) || !femaleVoiceKeywords.some(f => name.includes(f));
    return isArabic && isMale;
  });

  // 2. Any Arabic voice
  if (!candidate) {
    candidate = voices.find(v => (v.lang || '').toLowerCase().startsWith('ar'));
  }

  // 3. Fallback male voice
  if (!candidate) {
    candidate = voices.find(v => {
      const name = (v.name || '').toLowerCase();
      return maleVoiceKeywords.some(m => name.includes(m));
    });
  }

  selectedMaleVoice = candidate || voices[0] || null;
  return selectedMaleVoice;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  selectBestMaleArabicVoice();
  window.speechSynthesis.onvoiceschanged = () => {
    selectBestMaleArabicVoice();
  };
}

export function speakArabicText(text: string, enabled = true): void {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop prior recitation
    const utterance = new SpeechSynthesisUtterance();
    
    if (!selectedMaleVoice) {
      selectBestMaleArabicVoice();
    }

    if (selectedMaleVoice) {
      utterance.voice = selectedMaleVoice;
      utterance.lang = selectedMaleVoice.lang.startsWith('ar') ? selectedMaleVoice.lang : 'ar-SA';
    } else {
      utterance.lang = 'ar-SA';
    }

    utterance.text = text;
    utterance.rate = 0.82; // dignified, calm, measured pace
    utterance.pitch = 0.85; // resonant male tone
    utterance.volume = 0.95;

    window.speechSynthesis.speak(utterance);
  } catch {
    // Gracefully ignore voice synthesis failures
  }
}

/**
 * Realistic prayer bead click / chime sound using Web Audio API
 */
export function playBeadChime(enabled = true): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Bead clack / resonance
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(432, now); // 432 Hz soothing healing harmonic
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.15);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    // Subtle wooden knock transient
    const knockOsc = ctx.createOscillator();
    const knockGain = ctx.createGain();
    knockOsc.type = 'triangle';
    knockOsc.frequency.setValueAtTime(160, now);
    knockGain.gain.setValueAtTime(0.04, now);
    knockGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    knockOsc.connect(knockGain);
    knockGain.connect(ctx.destination);
    knockOsc.start(now);
    knockOsc.stop(now + 0.06);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.38);
  } catch {
    // Ignore audio failures
  }
}

/**
 * Celebratory golden chord when completing a cycle
 */
export function playCompletionHarmonics(enabled = true): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const notes = [432, 540, 648, 864, 1080]; // Harmonious pentatonic chord
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 1.8);
    });
  } catch {
    // Ignore
  }
}

export function triggerHapticVibration(duration = 25, enabled = true): void {
  if (!enabled) return;
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate(duration);
    } catch {
      // Ignore
    }
  }
}
