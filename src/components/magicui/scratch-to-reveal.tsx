"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ScratchToRevealProps {
  /**
   * Width of the scratch container
   */
  width: number;
  /**
   * Height of the scratch container  
   */
  height: number;
  /**
   * Minimum percentage of scratched area to be considered as completed (Value between 0 and 100)
   */
  minScratchPercentage?: number;
  /**
   * The class name to apply to the component
   */
  className?: string;
  /**
   * The content to display when revealed
   */
  children?: React.ReactNode;
  /**
   * Callback function called when scratch is completed
   */
  onComplete?: () => void;
  /**
   * Gradient colors for the scratch effect
   */
  gradientColors?: string[];
  /**
   * Reset key to trigger component reset
   */
  resetKey?: number;
}

export function ScratchToReveal({
  width,
  height,
  minScratchPercentage = 50,
  className,
  children,
  onComplete,
  gradientColors = ["#6366F1", "#8B5CF6", "#A855F7", "#C084FC"], // Vibrant purple-indigo gradient
  resetKey = 0
}: ScratchToRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileInstructions, setShowMobileInstructions] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const completionTriggeredRef = useRef(false); // Prevent multiple completion calls

  // Reset component when resetKey changes
  useEffect(() => {
    setIsCompleted(false);
    setRevealProgress(0);
    setIsScratching(false);
    lastPointRef.current = null;
    completionTriggeredRef.current = false; // Reset completion flag
    initCanvas();
  }, [resetKey]);

  // Detect mobile device and setup mobile optimizations
  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice || (isTouchDevice && isSmallScreen));
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    // Show mobile instructions briefly on mobile devices
    if (isMobile && !isCompleted) {
      setShowMobileInstructions(true);
      const timer = setTimeout(() => setShowMobileInstructions(false), 4000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', checkIsMobile);
      };
    }

    return () => window.removeEventListener('resize', checkIsMobile);
  }, [isMobile, isCompleted]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Create beautiful gradient overlay with vibrant colors
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradientColors.forEach((color, index) => {
      gradient.addColorStop(index / (gradientColors.length - 1), color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add a colorful semi-transparent overlay for better contrast
    ctx.fillStyle = "rgba(88, 28, 135, 0.7)"; // Purple overlay instead of black
    ctx.fillRect(0, 0, width, height);

    // Add sparkle texture with light colors for visual appeal
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Add some colored sparkles for magic effect
    const sparkleColors = ["rgba(255, 215, 0, 0.3)", "rgba(255, 20, 147, 0.3)", "rgba(0, 255, 255, 0.3)"];
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 0.5;
      ctx.fillStyle = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Add scratch instruction text with enhanced visibility and glow effect
    const fontSize = Math.min(width / 25, isMobile ? 20 : 24); // Slightly smaller on mobile
    const smallFontSize = Math.min(width / 37, isMobile ? 14 : 16);
    
    // Bright white text with colorful glow effect
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Create a glowing effect with multiple shadows
    ctx.shadowColor = "rgba(139, 92, 246, 0.8)"; // Purple glow
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = "rgba(139, 92, 246, 0.6)";
    ctx.lineWidth = 2;
    
    // Draw outline and fill for main text
    const mainText = isMobile ? "Touch to reveal..." : "Scratch to reveal...";
    ctx.strokeText(mainText, width / 2, height / 2 - 20);
    ctx.fillText(mainText, width / 2, height / 2 - 20);
    
    // Subtitle with similar glow treatment
    ctx.font = `${smallFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.shadowColor = "rgba(255, 20, 147, 0.6)"; // Pink glow for subtitle
    ctx.shadowBlur = 10;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 20, 147, 0.4)";
    const subText = isMobile ? "👆 Swipe with your finger 👆" : "✨ Swipe or scratch the surface ✨";
    ctx.strokeText(subText, width / 2, height / 2 + 25);
    ctx.fillText(subText, width / 2, height / 2 + 25);
    
    // Reset all effects
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = "transparent";
    ctx.lineWidth = 0;
  }, [width, height, gradientColors, isMobile]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const calculateScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let transparentPixels = 0;
    let totalPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      totalPixels++;
      if (pixels[i] < 128) {
        transparentPixels++;
      }
    }

    return totalPixels > 0 ? (transparentPixels / totalPixels) * 100 : 0;
  }, []);

  // Real-time progress sync effect for accurate percentage display
  useEffect(() => {
    if (!isCompleted) {
      const progressInterval = setInterval(() => {
        const currentProgress = calculateScratchPercentage();
        if (Math.abs(currentProgress - revealProgress) > 1) {
          setRevealProgress(currentProgress);
        }
      }, 150); // Update every 150ms for smooth real-time display
      
      return () => clearInterval(progressInterval);
    }
  }, [isCompleted, calculateScratchPercentage, revealProgress]);

  const autoReveal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isCompleted || completionTriggeredRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    completionTriggeredRef.current = true; // Prevent multiple calls

    ctx.globalCompositeOperation = "destination-out";
    
    // Create beautiful expanding circles effect
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.max(canvas.width, canvas.height) * 0.8;
    
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
      
      if (currentRadius < maxRadius) {
        requestAnimationFrame(expand);
      } else {
        // Complete the reveal process
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setRevealProgress(100);
        setIsCompleted(true);
        onComplete?.();
      }
    };
    
    expand();
  }, [isCompleted, onComplete]);

  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isCompleted || completionTriggeredRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Enhanced brush size for better coverage (larger on mobile for finger touch)
    const brushSize = isMobile ? 45 : 35;

    // Smooth interpolation between points for better scratch lines
    if (lastPointRef.current) {
      const lastX = lastPointRef.current.x;
      const lastY = lastPointRef.current.y;
      const distance = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
      
      if (distance > brushSize * 0.3) {
        const steps = Math.ceil(distance / (brushSize * 0.3));
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const smoothT = t * t * (3 - 2 * t); // Smoothstep function
          const interpX = lastX + (x - lastX) * smoothT;
          const interpY = lastY + (y - lastY) * smoothT;
          
          ctx.beginPath();
          ctx.arc(interpX, interpY, brushSize, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    // Draw current point
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
    ctx.fill();

    lastPointRef.current = { x, y };

    const percentage = calculateScratchPercentage();
    
    // Update progress in real-time for immediate feedback
    if (Math.abs(percentage - revealProgress) > 0.5) {
      setRevealProgress(percentage);
    }
    
    // Auto-reveal when 20% threshold is reached (much faster completion)
    if (percentage >= 20 && !isCompleted && !completionTriggeredRef.current) {
      setTimeout(() => {
        autoReveal();
      }, 100);
    } else if (percentage >= minScratchPercentage && !isCompleted && !completionTriggeredRef.current) {
      completionTriggeredRef.current = true; // Prevent multiple calls
      setRevealProgress(100);
      setIsCompleted(true);
      onComplete?.();
      
      // Clear entire canvas with animation
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [calculateScratchPercentage, minScratchPercentage, isCompleted, onComplete, autoReveal, revealProgress]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScratching(true);
    lastPointRef.current = null; // Reset for new stroke
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    scratch(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isScratching) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    scratch(x, y);
  };

  const handleMouseUp = () => {
    setIsScratching(false);
    lastPointRef.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsScratching(true);
    setShowMobileInstructions(false); // Hide instructions when user starts touching
    lastPointRef.current = null; // Reset for new stroke
    
    // Add haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Light vibration feedback
    }
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    scratch(x, y);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isScratching) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    scratch(x, y);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsScratching(false);
    lastPointRef.current = null;
  };

  return (
    <div className={cn("relative w-full flex flex-col items-center", className)}>
      {/* Mobile Instructions Overlay */}
      {isMobile && showMobileInstructions && !isCompleted && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4 rounded-t-lg">
          <div className="text-center text-white animate-pulse">
            <div className="text-lg font-bold mb-1">👆 Touch & Swipe</div>
            <div className="text-sm opacity-90">Use your finger to reveal the hidden image</div>
          </div>
        </div>
      )}

      {/* Main scratch container */}
      <div
        className={cn(
          "relative overflow-hidden rounded-lg shadow-lg transition-transform duration-200",
          isMobile ? "shadow-2xl" : "shadow-lg",
          isScratching && isMobile ? "scale-[1.02]" : ""
        )}
        style={{ width, height }}
      >
        {/* Content underneath */}
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
        
        {/* Scratch canvas overlay */}
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 touch-none transition-opacity duration-200",
            isMobile ? "cursor-none" : "cursor-pointer",
            isScratching && isMobile ? "opacity-95" : "opacity-100"
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsScratching(false);
            lastPointRef.current = null;
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            width: `${width}px`, 
            height: `${height}px`,
            display: isCompleted ? 'none' : 'block'
          }}
        />
      </div>
      
      {/* Progress Bar */}
      <div className={cn(
        "mt-6 w-full space-y-3",
        isMobile ? "max-w-sm px-4" : "max-w-md"
      )}>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
            Reveal Progress
          </span>
          <span className={cn(
            "text-primary font-bold animate-pulse",
            isMobile ? "text-xl" : "text-lg"
          )}>
            {Math.round(revealProgress)}%
          </span>
        </div>
        <div className={cn(
          "w-full bg-muted rounded-full overflow-hidden shadow-inner",
          isMobile ? "h-4" : "h-3"
        )}>
          <div 
            className="h-full bg-gradient-to-r from-primary via-secondary to-primary rounded-full transition-all duration-500 ease-out transform origin-left"
            style={{ 
              width: `${revealProgress}%`,
              boxShadow: revealProgress > 0 ? '0 0 10px rgba(139, 92, 246, 0.5)' : 'none'
            }}
          />
        </div>
        {revealProgress >= 20 && !isCompleted && (
          <div className={cn(
            "text-center text-primary font-medium animate-bounce",
            isMobile ? "text-sm" : "text-xs"
          )}>
            🎉 Auto-revealing soon...
          </div>
        )}
        
        {/* Mobile-specific progress indicator */}
        {isMobile && revealProgress > 0 && revealProgress < 20 && (
          <div className="text-center text-xs text-muted-foreground">
            Keep swiping! {Math.max(0, 20 - Math.round(revealProgress))}% to go
          </div>
        )}
      </div>
    </div>
  );
}
