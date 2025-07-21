import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Share2, RotateCcw, Sparkles } from 'lucide-react';
import { Confetti } from './Confetti';
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

  // Initialize canvas and overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;

    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');
    if (!ctx || !overlayCtx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    overlayCanvas.width = canvas.width;
    overlayCanvas.height = canvas.height;
    
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    overlayCtx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Create gradient overlay
    const gradient = overlayCtx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
    gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.8)');
    gradient.addColorStop(1, 'rgba(59, 7, 100, 0.9)');
    
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

  // Calculate reveal progress
  const calculateProgress = useCallback(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return 0;

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, overlayCanvas.width, overlayCanvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    let totalPixels = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparentPixels++;
    }

    return (transparentPixels / totalPixels) * 100;
  }, []);

  // Handle scratch/reveal interaction
  const handleReveal = useCallback((x: number, y: number) => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas || isCompleted) return;

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    const rect = overlayCanvas.getBoundingClientRect();
    const scaleX = overlayCanvas.width / rect.width;
    const scaleY = overlayCanvas.height / rect.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x * scaleX, y * scaleY, brushSize * window.devicePixelRatio, 0, 2 * Math.PI);
    ctx.fill();

    // Update progress
    const progress = calculateProgress();
    setRevealProgress(progress);

    if (progress >= revealThreshold && !isCompleted) {
      setIsCompleted(true);
      setShowConfetti(true);
      onRevealComplete?.();
      toast.success("🎉 Image revealed! Amazing discovery!");
      
      // Auto-hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [brushSize, calculateProgress, revealThreshold, isCompleted, onRevealComplete]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsRevealing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    handleReveal(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isRevealing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleReveal(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseUp = () => setIsRevealing(false);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsRevealing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    handleReveal(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isRevealing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    handleReveal(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsRevealing(false);
  };

  // Reset function
  const resetReveal = () => {
    setRevealProgress(0);
    setIsCompleted(false);
    setShowConfetti(false);
    
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;
    
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;
    
    const rect = overlayCanvas.getBoundingClientRect();
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
    ctx.font = 'bold 24px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch to reveal...', rect.width / 2, rect.height / 2);
    
    ctx.font = '16px system-ui';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('✨ Swipe or scratch the surface ✨', rect.width / 2, rect.height / 2 + 40);
    
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

  // Share functionality
  const shareImage = async () => {
    if (!isCompleted) {
      toast.error("Complete the reveal first! 🎨");
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this amazing revealed image!',
          text: 'I just revealed this incredible image! 🎨✨',
          url: window.location.href
        });
        toast.success("Shared successfully! 🚀");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard! 📋");
      }
    } catch (error) {
      toast.error("Sharing failed. Try again! 📤");
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {showConfetti && <Confetti />}
      
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
          className="absolute inset-0 w-full h-full cursor-pointer touch-none"
          style={{ display: imageLoaded ? 'block' : 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        {/* Loading State */}
        {!imageLoaded && (
          <div className="flex items-center justify-center h-96 bg-muted animate-pulse">
            <Sparkles className="w-8 h-8 text-muted-foreground animate-spin" />
          </div>
        )}
      </Card>
      
      {/* Progress Bar */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Reveal Progress</span>
          <span className="text-gradient-primary font-medium">
            {Math.round(revealProgress)}%
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300 ease-out"
            style={{ width: `${revealProgress}%` }}
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          onClick={resetReveal}
          variant="outline"
          size="sm"
          className="flex-1 hover-scale"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        
        <Button
          onClick={downloadImage}
          variant="outline"
          size="sm"
          className="flex-1 hover-scale"
          disabled={!isCompleted}
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        
        <Button
          onClick={shareImage}
          size="sm"
          className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover-scale"
          disabled={!isCompleted}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
      
      {/* Completion Message */}
      {isCompleted && (
        <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20 animate-reveal-scale">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gradient-primary mb-1">
              🎉 Congratulations!
            </h3>
            <p className="text-sm text-muted-foreground">
              You've successfully revealed the hidden image!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};