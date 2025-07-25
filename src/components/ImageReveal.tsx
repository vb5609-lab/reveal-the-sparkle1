import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Confetti } from './Confetti';
import { ShareDialog } from './ShareDialog';
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
  revealThreshold = 75,
  brushSize = 35,
  onRevealComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenImageRef = useRef<HTMLImageElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const revealQueueRef = useRef<{ x: number; y: number }[]>([]);
  const progressTimerRef = useRef<number>();
  const isDrawingRef = useRef<boolean>(false);
  const lastProgressCheckRef = useRef<number>(0);
  
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const { playSound } = useSounds();

  // Initialize canvas and overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;

    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');
    if (!ctx || !overlayCtx) return;

    // Set canvas size with performance considerations
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio, 2); // Cap pixel ratio for performance
    canvas.width = rect.width * pixelRatio;
    canvas.height = rect.height * pixelRatio;
    overlayCanvas.width = canvas.width;
    overlayCanvas.height = canvas.height;
    
    ctx.scale(pixelRatio, pixelRatio);
    overlayCtx.scale(pixelRatio, pixelRatio);

    // Performance optimizations for canvas rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    overlayCtx.imageSmoothingEnabled = true;
    overlayCtx.imageSmoothingQuality = 'high';

    // Create ultra-dark gradient overlay for maximum contrast
    const gradient = overlayCtx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, 'rgba(59, 7, 100, 0.985)');   // Ultra-dark purple
    gradient.addColorStop(0.5, 'rgba(88, 28, 135, 0.98)'); // Ultra-dark violet
    gradient.addColorStop(1, 'rgba(59, 7, 100, 0.985)');   // Ultra-dark purple
    
    overlayCtx.fillStyle = gradient;
    overlayCtx.fillRect(0, 0, rect.width, rect.height);
    
    // Add scratch instruction text
    overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    overlayCtx.font = 'bold 24px system-ui';
    overlayCtx.textAlign = 'center';
    overlayCtx.fillText('Scratch to reveal...', rect.width / 2, rect.height / 2);
    
    overlayCtx.font = '16px system-ui';
    overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    overlayCtx.fillText('✨ Swipe or scratch the surface ✨', rect.width / 2, rect.height / 2 + 40);
  }, [imageLoaded]);

  // Cleanup effect for animation frames
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Real-time accurate progress calculation
  const calculateProgress = useCallback(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return 0;

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return 0;

    // Remove throttling for real-time updates
    const imageData = ctx.getImageData(0, 0, overlayCanvas.width, overlayCanvas.height);
    const pixels = imageData.data;
    
    // Use smaller sample rate for more accurate real-time progress tracking
    let transparentPixels = 0;
    let totalSamples = 0;
    const sampleRate = 4; // Check every 4th pixel for maximum accuracy

    for (let i = 3; i < pixels.length; i += 4 * sampleRate) {
      totalSamples++;
      if (pixels[i] < 30) { // Even lower threshold for better sensitivity
        transparentPixels++;
      }
    }

    const progress = totalSamples > 0 ? (transparentPixels / totalSamples) * 100 : 0;
    return Math.min(progress, 100); // Cap at 100%
  }, []);

  // Real-time progress sync effect for accurate percentage display
  useEffect(() => {
    if (!imageLoaded || isCompleted) return;
    
    const progressInterval = setInterval(() => {
      const currentProgress = calculateProgress();
      if (Math.abs(currentProgress - revealProgress) > 1) {
        setRevealProgress(currentProgress);
      }
    }, 150); // Update every 150ms for smooth real-time display
    
    return () => clearInterval(progressInterval);
  }, [imageLoaded, isCompleted, calculateProgress, revealProgress]);

  // Ultra-optimized reveal processing with requestAnimationFrame throttling
  const processRevealQueue = useCallback(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas || isCompleted || revealQueueRef.current.length === 0 || isDrawingRef.current) return;

    isDrawingRef.current = true; // Prevent concurrent drawing

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) {
      isDrawingRef.current = false;
      return;
    }

    const rect = overlayCanvas.getBoundingClientRect();
    const scaleX = overlayCanvas.width / rect.width;
    const scaleY = overlayCanvas.height / rect.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Aggressive performance optimization based on device capabilities
    const isLowEndDevice = navigator.hardwareConcurrency <= 2 || window.devicePixelRatio > 2.5;
    const batchSize = isLowEndDevice ? 1 : 2; // Even smaller batches for better responsiveness
    const gapMultiplier = isLowEndDevice ? 0.4 : 0.2; // Optimized for smooth feel vs performance

    // Process only essential points for immediate responsiveness
    const processCount = Math.min(batchSize, revealQueueRef.current.length);
    
    // Use a single path for all points to reduce draw calls
    ctx.beginPath();
    
    for (let i = 0; i < processCount; i++) {
      const point = revealQueueRef.current.shift()!;
      const x = point.x * scaleX;
      const y = point.y * scaleY;

      if (lastPointRef.current) {
        const lastX = lastPointRef.current.x * scaleX;
        const lastY = lastPointRef.current.y * scaleY;
        
        const distance = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
        const maxGap = brushSize * gapMultiplier * window.devicePixelRatio;
        
        if (distance > maxGap) {
          const steps = Math.ceil(distance / maxGap);
          for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            
            // Use smoothstep interpolation for natural curves
            const smoothT = t * t * (3 - 2 * t);
            
            const interpX = lastX + (x - lastX) * smoothT;
            const interpY = lastY + (y - lastY) * smoothT;
            
            // Variable brush size based on speed for natural feel
            const speedFactor = Math.min(distance / (brushSize * 2), 1);
            const currentBrushSize = brushSize * (0.9 + speedFactor * 0.2);
            
            // Reduced randomness for smoother appearance
            const randomOffsetX = (Math.random() - 0.5) * brushSize * 0.1 * window.devicePixelRatio;
            const randomOffsetY = (Math.random() - 0.5) * brushSize * 0.1 * window.devicePixelRatio;
            
            ctx.beginPath();
            ctx.arc(
              interpX + randomOffsetX, 
              interpY + randomOffsetY, 
              currentBrushSize * window.devicePixelRatio, 
              0, 
              2 * Math.PI
            );
            ctx.fill();
          }
        }
      }

      // Draw current point with variable size for natural feel
      const currentBrushSize = brushSize * (0.95 + Math.random() * 0.1); // Slight size variation
      ctx.beginPath();
      ctx.arc(x, y, currentBrushSize * window.devicePixelRatio, 0, 2 * Math.PI);
      ctx.fill();

      lastPointRef.current = point;
    }

    // Performance-optimized sound and progress updates
    if (soundEnabled && Math.random() < 0.5) { // Reduced sound frequency for performance
      playSound('scratch');
    }

    // Real-time progress updates for accurate percentage display
    if (Math.random() < 0.8) { // Much higher frequency (80%) for real-time progress tracking
      const progress = calculateProgress();
      
      // Only update if there's a meaningful change (reduces flickering)
      if (Math.abs(progress - revealProgress) > 0.5) {
        setRevealProgress(progress);
      }

      // Auto-reveal when 40% threshold is reached
      if (progress >= 40 && !isCompleted) {
        setTimeout(() => {
          if (overlayCanvasRef.current) {
            const ctx = overlayCanvasRef.current.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
              setRevealProgress(100);
              setIsCompleted(true);
              setShowConfetti(true);
              if (soundEnabled) playSound('success');
              onRevealComplete?.();
              toast.success("🎉 Image revealed! Amazing discovery!");
              setTimeout(() => setShowConfetti(false), 3000);
            }
          }
        }, 100); // Faster response time
      }
    }

    // Mark drawing as complete and schedule next frame if needed
    isDrawingRef.current = false;
    
    // Continue processing if there are more points in queue
    if (revealQueueRef.current.length > 0) {
      requestAnimationFrame(processRevealQueue);
    }
  }, [brushSize, calculateProgress, isCompleted, soundEnabled, playSound]);

  // Enhanced reveal processing with real-time progress sync
  const handleReveal = useCallback((x: number, y: number) => {
    // Avoid duplicate points close together for better performance
    const lastPoint = revealQueueRef.current[revealQueueRef.current.length - 1];
    if (lastPoint) {
      const distance = Math.sqrt(Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2));
      if (distance < brushSize * 0.05) return; // Reduced threshold for more responsive drawing
    }
    
    revealQueueRef.current.push({ x, y });
    
    // Limit queue size for consistent performance across devices
    const maxQueueSize = navigator.hardwareConcurrency <= 2 ? 8 : 15; // Increased for smoother experience
    if (revealQueueRef.current.length > maxQueueSize) {
      revealQueueRef.current.shift();
    }
    
    // Use optimized requestAnimationFrame scheduling
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(() => {
        processRevealQueue();
        
        // Force progress update after processing to ensure sync
        setTimeout(() => {
          if (!isCompleted) {
            const currentProgress = calculateProgress();
            setRevealProgress(currentProgress);
          }
        }, 50);
        
        animationFrameRef.current = undefined;
      });
    }
  }, [processRevealQueue, brushSize, calculateProgress, isCompleted]);

  // Enhanced auto-reveal with smooth expanding effect
  const autoReveal = useCallback(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas || isCompleted) return;

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    
    // Create beautiful expanding circles effect
    const centerX = overlayCanvas.width / 2;
    const centerY = overlayCanvas.height / 2;
    const maxRadius = Math.max(overlayCanvas.width, overlayCanvas.height) * 0.8;
    
    let currentRadius = 0;
    const expandSpeed = maxRadius / 25; // 25 frames for ultra-smooth animation
    
    const expand = () => {
      // Multiple expanding circles for smoother effect
      for (let i = 0; i < 3; i++) {
        const radius = currentRadius - (i * expandSpeed * 0.3);
        if (radius > 0) {
          ctx.globalAlpha = 0.6 - (i * 0.15);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      
      currentRadius += expandSpeed;
      
      const progress = calculateProgress();
      setRevealProgress(progress);
      
      if (currentRadius < maxRadius && progress < 40) { // Stop expanding when 40% is reached
        requestAnimationFrame(expand);
      } else {
        // Complete the reveal process
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        
        // Force 100% completion
        setRevealProgress(100);
        setIsCompleted(true);
        setShowConfetti(true);
        if (soundEnabled) playSound('success');
        onRevealComplete?.();
        toast.success("🎉 Image revealed! Amazing discovery!");
        setTimeout(() => setShowConfetti(false), 3000);
      }
    };
    
    expand();
  }, [calculateProgress, isCompleted, onRevealComplete, soundEnabled, playSound]);

  // Enhanced mouse events with better responsiveness
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRevealing(true);
    lastPointRef.current = null; // Reset for new stroke
    const rect = e.currentTarget.getBoundingClientRect();
    handleReveal(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isRevealing) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    handleReveal(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRevealing(false);
    lastPointRef.current = null;
  };

  const handleMouseLeave = () => {
    setIsRevealing(false);
    lastPointRef.current = null;
  };

  // State for smooth touch tracking
  const touchVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchHistoryRef = useRef<{ x: number; y: number; time: number }[]>([]);
  const touchTimestampRef = useRef<number>(0);

  // Ultra-smooth touch events with velocity prediction and interpolation
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsRevealing(true);
    lastPointRef.current = null;
    touchHistoryRef.current = [];
    touchVelocityRef.current = { x: 0, y: 0 };
    
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    touchTimestampRef.current = performance.now();
    touchHistoryRef.current.push({ x, y, time: touchTimestampRef.current });
    
    handleReveal(x, y);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isRevealing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const currentTime = performance.now();
    
    // Calculate velocity for smooth interpolation
    if (touchHistoryRef.current.length > 0) {
      const lastTouch = touchHistoryRef.current[touchHistoryRef.current.length - 1];
      const deltaTime = currentTime - lastTouch.time;
      
      if (deltaTime > 0) {
        touchVelocityRef.current = {
          x: (x - lastTouch.x) / deltaTime,
          y: (y - lastTouch.y) / deltaTime
        };
      }
    }
    
    // Add current touch to history
    touchHistoryRef.current.push({ x, y, time: currentTime });
    
    // Keep only recent history for performance
    if (touchHistoryRef.current.length > 5) {
      touchHistoryRef.current.shift();
    }
    
    // Enhanced interpolation for ultra-smooth lines
    if (lastPointRef.current) {
      const lastX = lastPointRef.current.x;
      const lastY = lastPointRef.current.y;
      const distance = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
      
      // If distance is significant, add interpolated points
      if (distance > brushSize * 0.25) {
        const steps = Math.ceil(distance / (brushSize * 0.25));
        
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          
          // Use cubic interpolation for smoother curves
          const cubicT = t * t * (3 - 2 * t); // Smoothstep function
          
          const interpX = lastX + (x - lastX) * cubicT;
          const interpY = lastY + (y - lastY) * cubicT;
          
          // Add velocity-based prediction for even smoother feel
          const predictX = interpX + touchVelocityRef.current.x * 2;
          const predictY = interpY + touchVelocityRef.current.y * 2;
          
          handleReveal(interpX, interpY);
          
          // Add slight randomness for natural texture
          if (Math.random() < 0.2) {
            const offsetX = (Math.random() - 0.5) * brushSize * 0.3;
            const offsetY = (Math.random() - 0.5) * brushSize * 0.3;
            handleReveal(interpX + offsetX, interpY + offsetY);
          }
        }
      }
    }
    
    // Process the main touch point
    handleReveal(x, y);
    
    // Add pressure simulation based on velocity
    const velocity = Math.sqrt(
      touchVelocityRef.current.x * touchVelocityRef.current.x + 
      touchVelocityRef.current.y * touchVelocityRef.current.y
    );
    
    // For slower movements, add more coverage for smoother feel
    if (velocity < 0.5) {
      const extraPoints = 3;
      for (let i = 0; i < extraPoints; i++) {
        const angle = (Math.PI * 2 * i) / extraPoints;
        const radius = brushSize * 0.4;
        const extraX = x + Math.cos(angle) * radius;
        const extraY = y + Math.sin(angle) * radius;
        handleReveal(extraX, extraY);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsRevealing(false);
    lastPointRef.current = null;
    
    // Clean up touch tracking data
    touchHistoryRef.current = [];
    touchVelocityRef.current = { x: 0, y: 0 };
  };

  // Enhanced reset function
  const resetReveal = () => {
    setRevealProgress(0);
    setIsCompleted(false);
    setShowConfetti(false);
    setIsRevealing(false);
    
    // Clear animation frame and reset refs
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    lastPointRef.current = null;
    revealQueueRef.current = [];
    
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;
    
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;
    
    const rect = overlayCanvas.getBoundingClientRect();
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    // Recreate ultra-dark overlay for maximum contrast effect
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, 'rgba(59, 7, 100, 0.99)');   // Ultra-dark purple (almost black)
    gradient.addColorStop(0.3, 'rgba(88, 28, 135, 0.985)'); // Ultra-dark violet
    gradient.addColorStop(0.7, 'rgba(107, 33, 168, 0.985)'); // Ultra-dark purple
    gradient.addColorStop(1, 'rgba(59, 7, 100, 0.99)');   // Ultra-dark purple (almost black)
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Add sparkling effect overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const size = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Enhanced text with better styling - using correct dimensions
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = 'bold 28px system-ui';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.fillText('Scratch to reveal...', rect.width / 2, rect.height / 2);
    
    ctx.font = '18px system-ui';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 2;
    ctx.fillText('✨ Swipe or scratch the surface ✨', rect.width / 2, rect.height / 2 + 45);
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    toast.info("Ready for a new reveal! 🎯");
  };

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
        
        {/* Overlay Canvas */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none select-none"
          style={{ display: imageLoaded ? 'block' : 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={(e) => e.preventDefault()}
        />
        
        {/* Loading State */}
        {!imageLoaded && (
          <div className="flex items-center justify-center h-96 bg-muted animate-pulse">
            <Sparkles className="w-8 h-8 text-muted-foreground animate-spin" />
          </div>
        )}
      </Card>
      </motion.div>
      

      
      {/* Action Buttons - Mobile Responsive Layout */}
      <motion.div 
        className="flex flex-wrap gap-2 sm:gap-3 mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div className="flex-1 min-w-[80px]" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
        
        <motion.div className="flex-1 min-w-[90px]" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
        
        <motion.div className="flex-1 min-w-[80px]" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <ShareDialog
            imageUrl={hiddenImageSrc}
            isCompleted={isCompleted}
            onDownload={downloadImage}
          />
        </motion.div>
        
        {/* Sound Toggle */}
        <motion.div className="shrink-0" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="outline"
            size="sm"
            className="px-2 sm:px-3"
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