import React, { useState } from 'react';
import { useSounds } from '@/hooks/useSounds';
import { toast } from 'sonner';
import { ScratchToReveal } from '@/components/magicui/scratch-to-reveal';
import { Confetti } from './Confetti';

interface ImageRevealMagicUIProps {
  hiddenImageSrc: string;
  revealThreshold?: number;
  onRevealComplete?: () => void;
}

export const ImageRevealMagicUI: React.FC<ImageRevealMagicUIProps> = ({
  hiddenImageSrc,
  revealThreshold = 50,
  onRevealComplete
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [key, setKey] = useState(0); // For resetting the component
  const [canvasWidth, setCanvasWidth] = useState(600);
  const completionHandledRef = React.useRef(false); // Prevent duplicate completions
  
  const { playSound } = useSounds();

  // Set responsive canvas width with better mobile optimization
  React.useEffect(() => {
    const updateWidth = () => {
      const isMobile = window.innerWidth <= 768;
      const maxWidth = isMobile ? 
        Math.min(320, window.innerWidth) : 
        Math.min(480, window.innerWidth);
      setCanvasWidth(maxWidth);
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Initialize audio context on mobile for better sound support
  React.useEffect(() => {
    const initAudioOnMobile = () => {
      if (typeof window !== 'undefined' && window.innerWidth <= 768) {
        // Pre-initialize audio context for mobile
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioContext.state === 'suspended') {
            // Will be resumed on first user interaction
          }
        } catch (error) {
          console.warn('Audio context initialization failed:', error);
        }
      }
    };
    
    initAudioOnMobile();
  }, []);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      // No cleanup needed
    };
  }, []);

  const handleComplete = () => {
    // Prevent duplicate completion handling
    if (completionHandledRef.current || isCompleted) return;
    
    completionHandledRef.current = true;
    setIsCompleted(true);
    setShowConfetti(true);
    
    // Play success sound with mobile fallback
    if (soundEnabled) {
      try {
        playSound('success');
      } catch (error) {
        console.warn('Sound playback failed:', error);
      }
    }
    
    // Mobile haptic feedback for completion
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]); // Success vibration pattern
    }
    
    onRevealComplete?.();
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const resetReveal = () => {
    completionHandledRef.current = false; // Reset completion flag
    setIsCompleted(false);
    setShowConfetti(false);
    setKey(prev => prev + 1); // Force re-render of ScratchToReveal
    toast.info("Ready for a new reveal! 🎯");
  };

  return (
    <div className="relative w-full">
      {showConfetti && <Confetti />}
      
      {/* Container with dark glassmorphism background matching the page theme */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-br from-black/40 via-[#001122]/30 to-[#004aad]/10 backdrop-blur-sm border border-[#004aad]/20 shadow-2xl shadow-[#004aad]/5">
        <div className="relative overflow-hidden rounded-3xl">
          <ScratchToReveal
          width={canvasWidth}
          height={canvasWidth < 400 ? 300 : 400}
          minScratchPercentage={revealThreshold}
          onComplete={handleComplete}
          className="w-full rounded-3xl overflow-hidden shadow-2xl"
          gradientColors={["#004aad", "#0066cc", "#1a73e8", "#4285f4"]}
          resetKey={key}
        >
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
              <img
                src={hiddenImageSrc}
                alt="Hidden reveal"
                className="w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
              />
              {/* Static glassmorphism overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Primary dark glassmorphism layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-[#001122]/15 to-[#004aad]/10 backdrop-blur-[1px]"></div>
                
                {/* Subtle dark geometric patterns */}
                <div className="absolute inset-0 opacity-15">
                  <div className="absolute top-8 left-8 w-24 h-24 rounded-full bg-gradient-to-br from-[#004aad]/20 to-transparent"></div>
                  <div className="absolute top-16 right-12 w-16 h-16 rounded-full bg-gradient-to-bl from-black/30 to-transparent"></div>
                  <div className="absolute bottom-12 left-16 w-20 h-20 rounded-full bg-gradient-to-tr from-[#004aad]/15 to-transparent"></div>
                </div>
                
                {/* Floating dark theme particles */}
                <div className="absolute inset-0">
                  <div className="absolute top-6 left-12 w-1 h-1 bg-[#004aad]/80 rounded-full animate-pulse"></div>
                  <div className="absolute top-20 right-8 w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-300"></div>
                  <div className="absolute bottom-16 left-8 w-1 h-1 bg-[#004aad]/70 rounded-full animate-ping delay-500"></div>
                  <div className="absolute bottom-8 right-16 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse delay-700"></div>
                </div>
                
                {/* Dark theme grid overlay */}
                <div className="absolute inset-0 opacity-3">
                  <div className="w-full h-full" style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(0, 74, 173, 0.15) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0, 74, 173, 0.15) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}></div>
                </div>
                
                {/* Soft dark inner glow */}
                <div className="absolute inset-0 rounded-3xl shadow-inner shadow-black/20"></div>
              </div>
            </div>
          </ScratchToReveal>
        </div>
        
        {/* Reset Button with Google Pay inspired design */}
        <div className="flex justify-center mt-6">
          <button
            onClick={resetReveal}
            className="group relative px-8 py-3 bg-gradient-to-r from-[#004aad] to-[#0066cc] hover:from-[#003d94] hover:to-[#0055b3] text-white text-sm font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#004aad]/50 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Reveal
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
