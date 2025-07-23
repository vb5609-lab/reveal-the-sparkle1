import { useCallback, useRef } from 'react';

// Optimized Web Audio API sounds with shared context
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioContext;
};

export const useSounds = () => {
  const lastSoundTimeRef = useRef(0);
  
  const playSound = useCallback(async (type: 'scratch' | 'success') => {
    // Throttle sound playing for performance (reduced from 50ms to 30ms for better feel)
    const now = performance.now();
    if (type === 'scratch' && now - lastSoundTimeRef.current < 30) {
      return;
    }
    lastSoundTimeRef.current = now;

    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume context if suspended (required for mobile browsers)
    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
        // Give a small delay for context to properly resume
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } catch (error) {
      console.warn('Audio context resume failed:', error);
      return;
    }

    if (type === 'scratch') {
      // Pleasant scratch sound with multiple layers for realism
      const duration = 0.08;
      
      // Main scratch sound - softer frequency range
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const filter1 = ctx.createBiquadFilter();
      
      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(ctx.destination);
      
      osc1.type = 'sawtooth'; // Sawtooth for pleasant texture
      filter1.type = 'highpass';
      filter1.frequency.setValueAtTime(400, ctx.currentTime);
      filter1.Q.setValueAtTime(2, ctx.currentTime);
      
      gain1.gain.setValueAtTime(0.03, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc1.start();
      osc1.stop(ctx.currentTime + duration);
      
      // Secondary layer for depth - gentle crackle
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(400 + Math.random() * 100, ctx.currentTime + duration);
      
      gain2.gain.setValueAtTime(0.015, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc2.start();
      osc2.stop(ctx.currentTime + duration);
    } else if (type === 'success') {
      // Enhanced success chime with better mobile support
      const frequencies = [523.25, 659.25, 783.99]; // C, E, G notes
      const baseDelay = ctx.currentTime + 0.05; // Small delay to ensure context is ready
      
      frequencies.forEach((freq, index) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, baseDelay);
          
          const startTime = baseDelay + index * 0.08;
          const duration = 0.35; // Slightly longer for mobile
          
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02); // Stronger initial volume
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          
          osc.start(startTime);
          osc.stop(startTime + duration);
        } catch (error) {
          console.warn('Error creating success sound oscillator:', error);
        }
      });
    }
  }, []);

  return { playSound };
};