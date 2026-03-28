import { useCallback, useRef } from 'react';

export function useAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, vol = 0.1) => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, []);

  const playClick = useCallback(() => {
    playTone(800, 'sine', 0.1, 0.05);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    // Arpeggio
    playTone(440, 'square', 0.1, 0.05);
    setTimeout(() => playTone(554, 'square', 0.1, 0.05), 100);
    setTimeout(() => playTone(659, 'square', 0.2, 0.05), 200);
  }, [playTone]);

  const playError = useCallback(() => {
    playTone(150, 'sawtooth', 0.3, 0.1);
    setTimeout(() => playTone(100, 'sawtooth', 0.4, 0.1), 150);
  }, [playTone]);

  const playAlert = useCallback(() => {
    playTone(800, 'square', 0.1, 0.1);
    setTimeout(() => playTone(800, 'square', 0.1, 0.1), 200);
  }, [playTone]);

  return { playClick, playSuccess, playError, playAlert, playTone, initAudio };
}
