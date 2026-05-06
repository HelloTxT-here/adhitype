
let audioCtx: AudioContext | null = null;

export const playKeySound = (type: 'none' | 'mechanical' | 'clicky' | 'pop', volume: number) => {
  if (type === 'none' || volume === 0) return;
  
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  // Resume if suspended (browser policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  gainNode.gain.setValueAtTime(volume * 0.05, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  if (type === 'mechanical') {
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.08);
  } else if (type === 'clicky') {
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.04);
  } else if (type === 'pop') {
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.1);
  } else if ((type as string) === 'fail') {
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(100, now);
    oscillator.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    gainNode.gain.setValueAtTime(volume * 0.1, now);
  }

  oscillator.start(now);
  oscillator.stop(now + 0.1);
};
