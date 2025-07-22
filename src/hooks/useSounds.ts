import { useCallback, useRef } from 'react';

// Create a single AudioContext instance and reuse it
let globalAudioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  
  if (!globalAudioContext) {
    try {
      globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  
  // Resume context if suspended (for user gesture requirement)
  if (globalAudioContext.state === 'suspended') {
    globalAudioContext.resume();
  }
  
  return globalAudioContext;
};

export const useSounds = () => {
  const lastSoundTime = useRef(0);
  
  const playSound = useCallback((type: 'scratch' | 'success') => {
    const audioContext = getAudioContext();
    if (!audioContext) return;
    
    // Throttle scratch sounds to prevent audio lag
    const now = performance.now();
    if (type === 'scratch' && now - lastSoundTime.current < 50) {
      return;
    }
    lastSoundTime.current = now;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'scratch') {
      // Quick scratch sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'success') {
      // Success chime
      const frequencies = [523.25, 659.25, 783.99]; // C, E, G notes
      frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);
        gain.gain.setValueAtTime(0.1, audioContext.currentTime + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.3);
        
        osc.start(audioContext.currentTime + index * 0.1);
        osc.stop(audioContext.currentTime + index * 0.1 + 0.3);
      });
    }
  }, []);

  return { playSound };
};