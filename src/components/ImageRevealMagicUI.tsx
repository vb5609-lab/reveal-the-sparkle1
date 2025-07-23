import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Confetti } from './Confetti';
import { ShareDialog } from './ShareDialog';
import { useSounds } from '@/hooks/useSounds';
import { toast } from 'sonner';
import { ScratchToReveal } from '@/components/magicui/scratch-to-reveal';

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
      const padding = isMobile ? 40 : 80; // Less padding on mobile
      const maxWidth = isMobile ? 
        Math.min(400, window.innerWidth - padding) : // Smaller max on mobile
        Math.min(600, window.innerWidth - padding);
      setCanvasWidth(maxWidth);
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleComplete = () => {
    // Prevent duplicate completion handling
    if (completionHandledRef.current || isCompleted) return;
    
    completionHandledRef.current = true;
    setIsCompleted(true);
    setShowConfetti(true);
    if (soundEnabled) playSound('success');
    onRevealComplete?.();
    toast.success("🎉 Image revealed! Amazing discovery!");
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const resetReveal = () => {
    completionHandledRef.current = false; // Reset completion flag
    setIsCompleted(false);
    setShowConfetti(false);
    setKey(prev => prev + 1); // Force re-render of ScratchToReveal
    toast.info("Ready for a new reveal! 🎯");
  };

  const downloadImage = () => {
    if (!isCompleted) {
      toast.error("Complete the reveal first! 🎨");
      return;
    }
    
    const link = document.createElement('a');
    link.download = 'revealed-image.png';
    link.href = hiddenImageSrc;
    link.click();
    toast.success("Image downloaded! 📥");
  };

  return (
    <motion.div 
      className="relative w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <AnimatePresence>
        {showConfetti && <Confetti />}
      </AnimatePresence>
      
      <motion.div
        whileHover={{ scale: window.innerWidth > 768 ? 1.02 : 1.0 }} // No hover scale on mobile
        transition={{ duration: 0.2 }}
      >
        <Card className="relative overflow-hidden bg-card border-card-border hover-glow">
          {!imageLoaded && (
            <div className="flex items-center justify-center h-96 bg-muted animate-pulse">
              <Sparkles className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
          )}
          
          <div className="p-3 sm:p-4 md:p-6"> {/* More responsive padding */}
            <ScratchToReveal
              width={canvasWidth}
              height={canvasWidth < 400 ? 300 : 400} // Smaller height on very small screens
              minScratchPercentage={revealThreshold}
              onComplete={handleComplete}
              className="w-full"
              gradientColors={["#7c3aed", "#8b5cf6", "#a855f7", "#c084fc"]} // Beautiful violet gradient
              resetKey={key}
            >
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={hiddenImageSrc}
                  alt="Hidden reveal"
                  className="w-full h-full object-cover rounded-lg"
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            </ScratchToReveal>
          </div>
        </Card>
      </motion.div>
      
      {/* Action Buttons - Mobile Responsive Layout */}
      <motion.div 
        className="flex flex-wrap gap-2 sm:gap-3 mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div className="flex-1 min-w-[80px]" whileHover={{ scale: window.innerWidth > 768 ? 1.02 : 1.0 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={resetReveal}
            variant="outline"
            size="sm"
            className="w-full text-xs sm:text-sm"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Reset
          </Button>
        </motion.div>
        
        <motion.div className="flex-1 min-w-[90px]" whileHover={{ scale: window.innerWidth > 768 ? 1.02 : 1.0 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={downloadImage}
            variant="outline"
            size="sm"
            className="w-full text-xs sm:text-sm"
            disabled={!isCompleted}
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Download
          </Button>
        </motion.div>
        
        <motion.div className="flex-1 min-w-[80px]" whileHover={{ scale: window.innerWidth > 768 ? 1.02 : 1.0 }} whileTap={{ scale: 0.98 }}>
          <ShareDialog
            imageUrl={hiddenImageSrc}
            isCompleted={isCompleted}
            onDownload={downloadImage}
          />
        </motion.div>
        
        {/* Sound Toggle */}
        <motion.div className="shrink-0" whileHover={{ scale: window.innerWidth > 768 ? 1.02 : 1.0 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="outline"
            size="sm"
            className="px-2 sm:px-3"
            title={soundEnabled ? "Disable sound" : "Enable sound"}
          >
            {soundEnabled ? <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />}
          </Button>
        </motion.div>
      </motion.div>
      
      {/* Completion Message */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div 
            className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.h3 
                className="text-lg font-semibold text-gradient-primary mb-1"
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3 }}
              >
                🎉 Congratulations!
              </motion.h3>
              <motion.p 
                className="text-sm text-muted-foreground"
                initial={{ y: 10 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.4 }}
              >
                You've successfully revealed the hidden image!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
