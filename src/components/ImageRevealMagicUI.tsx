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
        Math.min(280, window.innerWidth - 32) : // Better mobile sizing with margin
        Math.min(480, window.innerWidth - 64);
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
    <div className="relative w-full px-2 sm:px-0">
      {showConfetti && <Confetti />}
      
      {/* Container with dark glassmorphism background matching the page theme */}
      <div className="relative p-3 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-black/40 via-[#001122]/30 to-[#004aad]/10 backdrop-blur-sm border border-[#004aad]/20 shadow-2xl shadow-[#004aad]/5 mx-auto max-w-xl">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
          <ScratchToReveal
          width={canvasWidth}
          height={canvasWidth < 300 ? 250 : canvasWidth < 400 ? 300 : 400}
          minScratchPercentage={revealThreshold}
          onComplete={handleComplete}
          className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl"
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
            </div>
          </ScratchToReveal>
        </div>
        
        {/* Reset Button with Google Pay inspired design - Mobile optimized */}
        <div className="flex justify-center mt-4 sm:mt-6">
          <button
            onClick={resetReveal}
            className="group relative px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-[#004aad] to-[#0066cc] hover:from-[#003d94] hover:to-[#0055b3] text-white text-sm font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#004aad]/50 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[120px] touch-manipulation"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative">
              Reset
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
