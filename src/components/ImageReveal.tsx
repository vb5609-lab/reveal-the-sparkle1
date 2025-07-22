import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Share2, RotateCcw, Sparkles, Volume2, VolumeX, X, Copy, MessageSquare, Facebook, Linkedin, Twitter, Instagram } from 'lucide-react';
import { Confetti } from './Confetti';
import { useSounds } from '@/hooks/useSounds';
import { toast } from 'sonner';

interface ImageRevealProps {
  hiddenImageSrc: string;
  revealThreshold?: number;
  brushSize?: number;
  onRevealComplete?: () => void;
}

export const ImageReveal: React.FC<ImageRevealProps> = ({
  hiddenImageSrc,
  revealThreshold = 50, // Changed from 75 to 50 for faster auto-reveal
  brushSize = 40,
  onRevealComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenImageRef = useRef<HTMLImageElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  // Performance optimization refs
  const lastProgressCheck = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const progressCheckInterval = useRef<number | null>(null);
  
  const { playSound } = useSounds();

  // Enhanced share functionality with multiple platforms
  const generateShareContent = () => {
    const title = "Amazing Image Revealed! ✨";
    const description = "I just scratched and revealed this incredible hidden image! Try it yourself! 🎨✨";
    const url = window.location.href;
    const hashtags = "ImageReveal,Discovery,ScratchGame,Interactive";
    
    return { title, description, url, hashtags };
  };

  const shareToWhatsApp = () => {
    const { description, url } = generateShareContent();
    const text = encodeURIComponent(`${description}\n\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    toast.success("Opening WhatsApp! 💬");
  };

  const shareToFacebook = () => {
    const { url, description } = generateShareContent();
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(description)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    toast.success("Opening Facebook! 📘");
  };

  const shareToLinkedIn = () => {
    const { url, title, description } = generateShareContent();
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    toast.success("Opening LinkedIn! 💼");
  };

  const shareToTwitter = () => {
    const { description, url, hashtags } = generateShareContent();
    const text = encodeURIComponent(`${description}\n\n${url}\n\n#${hashtags.replace(/,/g, ' #')}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'width=600,height=400');
    toast.success("Opening Twitter! 🐦");
  };

  const shareToInstagram = async () => {
    const { description, url } = generateShareContent();
    const content = `${description}\n\nTry it yourself: ${url}\n\n#ImageReveal #Discovery #Interactive #ScratchGame`;
    
    try {
      // Copy content to clipboard
      await navigator.clipboard.writeText(content);
      toast.success("Content copied! 📋 Opening Instagram...");
      
      // Simple approach - just open Instagram web
      setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank');
        toast.info("Paste the copied content in your Instagram post! 📸✨");
      }, 1000);
      
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("Content copied! 📋 Opening Instagram...");
        setTimeout(() => {
          window.open('https://www.instagram.com/', '_blank');
          toast.info("Paste the copied content in your Instagram post! 📸✨");
        }, 1000);
      } catch (err) {
        document.body.removeChild(textArea);
        toast.error("Please copy this content manually and share on Instagram!");
        console.log("Content to share:", content);
      }
    }
  };

  const copyToClipboard = async () => {
    const { title, description, url } = generateShareContent();
    const content = `${title}\n\n${description}\n\nTry it yourself: ${url}\n\n#ImageReveal #Discovery #ScratchGame`;
    
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Content copied to clipboard! 📋✨");
      
      // Also show a brief instruction
      setTimeout(() => {
        toast.info("You can now paste this anywhere to share! 🚀");
      }, 1500);
      
    } catch (error) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("Content copied to clipboard! 📋✨");
        
        setTimeout(() => {
          toast.info("You can now paste this anywhere to share! 🚀");
        }, 1500);
        
      } catch (err) {
        // Final fallback - show the content to user
        toast.error("Copy failed! Here's the content to share manually:");
        console.log("Content to share:", content);
        
        // Show content in a simple alert as last resort
        setTimeout(() => {
          alert(`Copy this content:\n\n${content}`);
        }, 100);
      }
    }
  };

  const useNativeShare = async () => {
    if (!navigator.share) {
      setShowShareMenu(true);
      return;
    }

    const { title, description, url } = generateShareContent();
    
    try {
      await navigator.share({
        title,
        text: description,
        url
      });
      toast.success("Shared successfully! 🚀");
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setShowShareMenu(true);
      }
    }
  };

  // Optimized canvas initialization with mobile performance improvements
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;

    const ctx = canvas.getContext('2d', { 
      alpha: true, 
      willReadFrequently: false,
      desynchronized: true // Better performance on mobile
    });
    const overlayCtx = overlayCanvas.getContext('2d', { 
      alpha: true, 
      willReadFrequently: true,  // We read this frequently for progress calculation
      desynchronized: true // Better performance on mobile
    });
    if (!ctx || !overlayCtx) return;

    // Set canvas size with mobile optimization
    const rect = canvas.getBoundingClientRect();
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2); // Lower ratio for mobile
    
    canvas.width = rect.width * pixelRatio;
    canvas.height = rect.height * pixelRatio;
    overlayCanvas.width = canvas.width;
    overlayCanvas.height = canvas.height;
    
    ctx.scale(pixelRatio, pixelRatio);
    overlayCtx.scale(pixelRatio, pixelRatio);

    // Optimize canvas rendering with mobile-specific settings
    ctx.imageSmoothingEnabled = !isMobile; // Disable on mobile for performance
    ctx.imageSmoothingQuality = isMobile ? 'low' : 'high';
    overlayCtx.imageSmoothingEnabled = !isMobile;
    overlayCtx.imageSmoothingQuality = 'low'; // Always low for overlay for performance

    // Create gradient overlay
    const gradient = overlayCtx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
    gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.8)');
    gradient.addColorStop(1, 'rgba(59, 7, 100, 0.9)');
    
    overlayCtx.fillStyle = gradient;
    overlayCtx.fillRect(0, 0, rect.width, rect.height);
    
    // Add scratch instruction text
    overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    overlayCtx.font = `bold ${isMobile ? '20px' : '24px'} system-ui`; // Smaller font on mobile
    overlayCtx.textAlign = 'center';
    overlayCtx.fillText('Scratch to reveal...', rect.width / 2, rect.height / 2);
    
    overlayCtx.font = `${isMobile ? '14px' : '16px'} system-ui`;
    overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    overlayCtx.fillText('✨ Swipe or scratch the surface ✨', rect.width / 2, rect.height / 2 + 40);
  }, [imageLoaded]);

  // Cleanup effect for performance optimization
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (progressCheckInterval.current) {
        clearInterval(progressCheckInterval.current);
      }
    };
  }, []);

  // Improved progress calculation with better edge detection
  const calculateProgress = useCallback(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return 0;

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, overlayCanvas.width, overlayCanvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    let totalPixels = 0;

    // Better sampling strategy that includes corners and edges
    const width = overlayCanvas.width;
    const height = overlayCanvas.height;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const sampleRate = isMobile ? 8 : 4; // Less frequent sampling on mobile for performance
    
    for (let y = 0; y < height; y += sampleRate) {
      for (let x = 0; x < width; x += sampleRate) {
        const index = (y * width + x) * 4 + 3; // Alpha channel
        if (index < pixels.length) {
          totalPixels++;
          if (pixels[index] < 128) { // Consider semi-transparent as revealed
            transparentPixels++;
          }
        }
      }
    }

    return totalPixels > 0 ? (transparentPixels / totalPixels) * 100 : 0;
  }, []);

  // Throttled progress update
  const updateProgress = useCallback(() => {
    if (animationFrameId.current) return;
    
    animationFrameId.current = requestAnimationFrame(() => {
      const progress = calculateProgress();
      setRevealProgress(progress);
      animationFrameId.current = null;
      
      // Check for completion
      if (progress >= revealThreshold && !isCompleted) {
        setIsCompleted(true);
        setShowConfetti(true);
        if (soundEnabled) playSound('success');
        onRevealComplete?.();
        toast.success("🎉 Image revealed! Amazing discovery!");
        setTimeout(() => setShowConfetti(false), 3000);
      }
    });
  }, [calculateProgress, revealThreshold, isCompleted, onRevealComplete, soundEnabled, playSound]);

  // Enhanced handle reveal function with better edge/corner handling
  const handleReveal = useCallback((x: number, y: number) => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas || isCompleted) return;

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    const rect = overlayCanvas.getBoundingClientRect();
    const scaleX = overlayCanvas.width / rect.width;
    const scaleY = overlayCanvas.height / rect.height;
    
    // Convert coordinates
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    // Ensure coordinates are within bounds (important for corners/edges)
    const clampedX = Math.max(0, Math.min(canvasX, overlayCanvas.width));
    const clampedY = Math.max(0, Math.min(canvasY, overlayCanvas.height));
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const adjustedBrushSize = isMobile ? brushSize * 1.2 : brushSize; // Slightly larger brush on mobile
    const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);

    // Optimized canvas operations with better edge handling
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(clampedX, clampedY, adjustedBrushSize * pixelRatio, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add extra coverage for corner/edge areas
    if (clampedX <= adjustedBrushSize || clampedX >= overlayCanvas.width - adjustedBrushSize ||
        clampedY <= adjustedBrushSize || clampedY >= overlayCanvas.height - adjustedBrushSize) {
      // Add additional brush stroke for better corner coverage
      ctx.beginPath();
      ctx.arc(clampedX, clampedY, adjustedBrushSize * pixelRatio * 0.7, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Play scratch sound (handled by useSounds throttling)
    if (soundEnabled) {
      playSound('scratch');
    }

    // Throttled progress update
    updateProgress();
  }, [brushSize, isCompleted, soundEnabled, playSound, updateProgress]);

  // Optimized mouse events with throttling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsRevealing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    handleReveal(e.clientX - rect.left, e.clientY - rect.top);
  }, [handleReveal]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isRevealing) return;
    
    // Mobile-optimized throttling
    const now = performance.now();
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const throttleTime = isMobile ? 32 : 16; // 30fps on mobile, 60fps on desktop
    
    if (now - lastProgressCheck.current < throttleTime) return;
    lastProgressCheck.current = now;
    
    const rect = e.currentTarget.getBoundingClientRect();
    handleReveal(e.clientX - rect.left, e.clientY - rect.top);
  }, [isRevealing, handleReveal]);

  const handleMouseUp = useCallback(() => {
    setIsRevealing(false);
  }, []);

  // Optimized touch events with throttling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsRevealing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    handleReveal(touch.clientX - rect.left, touch.clientY - rect.top);
  }, [handleReveal]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!isRevealing) return;
    
    // Enhanced mobile touch handling with better throttling
    const now = performance.now();
    if (now - lastProgressCheck.current < 32) return; // 30fps for smooth mobile performance
    lastProgressCheck.current = now;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    
    // Ensure touch coordinates are valid
    if (touch) {
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      
      // Clamp touch coordinates to canvas bounds
      const clampedX = Math.max(0, Math.min(touchX, rect.width));
      const clampedY = Math.max(0, Math.min(touchY, rect.height));
      
      handleReveal(clampedX, clampedY);
    }
  }, [isRevealing, handleReveal]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsRevealing(false);
  }, []);

  // Optimized reset function with mobile considerations
  const resetReveal = useCallback(() => {
    // Cancel any pending operations
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    
    setRevealProgress(0);
    setIsCompleted(false);
    setShowConfetti(false);
    
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;
    
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;
    
    const rect = overlayCanvas.getBoundingClientRect();
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    // Recreate overlay
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
    gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.8)');
    gradient.addColorStop(1, 'rgba(59, 7, 100, 0.9)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `bold ${isMobile ? '20px' : '24px'} system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('Scratch to reveal...', rect.width / 2, rect.height / 2);
    
    ctx.font = `${isMobile ? '14px' : '16px'} system-ui`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('✨ Swipe or scratch the surface ✨', rect.width / 2, rect.height / 2 + 40);
    
    toast.info("Ready for a new reveal! 🎯");
  }, []);

  // Download functionality
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

  // Enhanced share functionality with metadata
  const shareImage = async () => {
    if (!isCompleted) {
      toast.error("Complete the reveal first! 🎨");
      return;
    }

    // Try native sharing first, fallback to custom menu
    await useNativeShare();
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
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="relative overflow-hidden bg-card border-card-border hover-glow">
        {/* Hidden Image */}
        <img
          ref={hiddenImageRef}
          src={hiddenImageSrc}
          alt="Hidden reveal"
          className="w-full h-auto max-h-96 object-cover"
          onLoad={() => setImageLoaded(true)}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
        
        {/* Reveal Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
        
        {/* Overlay Canvas with mobile optimizations */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none select-none"
          style={{ 
            display: imageLoaded ? 'block' : 'none',
            touchAction: 'none', // Prevent scrolling on mobile
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={(e) => e.preventDefault()} // Prevent context menu on long press
        />
        
        {/* Loading State */}
        {!imageLoaded && (
          <div className="flex items-center justify-center h-96 bg-muted animate-pulse">
            <Sparkles className="w-8 h-8 text-muted-foreground animate-spin" />
          </div>
        )}
      </Card>
      </motion.div>
      
      {/* Progress Bar */}
      <motion.div 
        className="mt-4 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Reveal Progress</span>
          <motion.span 
            className="text-gradient-primary font-medium"
            key={Math.round(revealProgress)}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {Math.round(revealProgress)}%
          </motion.span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-primary-glow"
            initial={{ width: 0 }}
            animate={{ width: `${revealProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </motion.div>
      
      {/* Action Buttons */}
      <motion.div 
        className="flex gap-3 mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={resetReveal}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </motion.div>
        
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={downloadImage}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={!isCompleted}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </motion.div>
        
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={shareImage}
            size="sm"
            className="w-full bg-gradient-to-r from-primary to-primary-glow"
            disabled={!isCompleted}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </motion.div>
        
        {/* Sound Toggle */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="outline"
            size="sm"
            className="px-3"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
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

      {/* Enhanced Share Menu */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareMenu(false)}
          >
            <motion.div 
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gradient-primary">Share Your Discovery! ✨</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareMenu(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button
                  onClick={() => { shareToWhatsApp(); setShowShareMenu(false); }}
                  variant="outline"
                  className="h-12 flex flex-col gap-1 hover:bg-green-50 hover:border-green-200"
                >
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span className="text-xs">WhatsApp</span>
                </Button>

                <Button
                  onClick={() => { shareToFacebook(); setShowShareMenu(false); }}
                  variant="outline"
                  className="h-12 flex flex-col gap-1 hover:bg-blue-50 hover:border-blue-200"
                >
                  <Facebook className="h-5 w-5 text-blue-600" />
                  <span className="text-xs">Facebook</span>
                </Button>

                <Button
                  onClick={() => { shareToLinkedIn(); setShowShareMenu(false); }}
                  variant="outline"
                  className="h-12 flex flex-col gap-1 hover:bg-blue-50 hover:border-blue-200"
                >
                  <Linkedin className="h-5 w-5 text-blue-700" />
                  <span className="text-xs">LinkedIn</span>
                </Button>

                <Button
                  onClick={() => { shareToTwitter(); setShowShareMenu(false); }}
                  variant="outline"
                  className="h-12 flex flex-col gap-1 hover:bg-blue-50 hover:border-blue-200"
                >
                  <Twitter className="h-5 w-5 text-blue-500" />
                  <span className="text-xs">Twitter</span>
                </Button>

                <Button
                  onClick={() => { shareToInstagram(); setShowShareMenu(false); }}
                  variant="outline"
                  className="h-12 flex flex-col gap-1 hover:bg-pink-50 hover:border-pink-200 dark:hover:bg-pink-950/20"
                >
                  <Instagram className="h-5 w-5 text-pink-600" />
                  <span className="text-xs">Instagram</span>
                </Button>

                <Button
                  onClick={() => { copyToClipboard(); setShowShareMenu(false); }}
                  variant="outline"
                  className="h-12 flex flex-col gap-1 hover:bg-gray-50 hover:border-gray-200"
                >
                  <Copy className="h-5 w-5 text-gray-600" />
                  <span className="text-xs">Copy Link</span>
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Choose your preferred platform to share this amazing discovery! 🚀
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ImageReveal;