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
  gradientColors = ["#7c3aed", "#8b5cf6", "#a855f7", "#c084fc"], // Beautiful violet gradient
  resetKey = 0
}: ScratchToRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
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

  // Detect mobile device for optimizations
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
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Create glassmorphism overlay with #004aad base
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(0, 74, 173, 0.95)");
    gradient.addColorStop(0.5, "rgba(0, 74, 173, 0.98)");
    gradient.addColorStop(1, "rgba(0, 74, 173, 0.95)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add glassmorphism texture effects
    ctx.globalAlpha = 0.1;
    
    // Add subtle geometric patterns for glassmorphism effect
    const patternCount = 30;
    for (let i = 0; i < patternCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 40 + 10;
      const opacity = 0.05 + Math.random() * 0.1;
      
      ctx.globalAlpha = opacity;
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Add frosted glass grid pattern
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    const gridSize = 30;
    
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1; // Reset alpha

    // Add scratch instruction text with enhanced visibility and modern design
    const fontSize = Math.min(width / 22, isMobile ? 22 : 26); // Slightly larger and more responsive
    const smallFontSize = Math.min(width / 32, isMobile ? 16 : 18);
    
    // Modern white text with sophisticated glow effect
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Create a premium multi-layer glow effect with violet tones
    const glowLayers = [
      { color: "rgba(168, 85, 247, 0.8)", blur: 20, offset: 0 },    // violet-400 primary glow
      { color: "rgba(196, 132, 252, 0.6)", blur: 15, offset: 0 },   // violet-300 secondary glow
      { color: "rgba(221, 173, 252, 0.4)", blur: 10, offset: 0 },   // violet-200 tertiary glow
    ];
    
    const mainText = "Scratch here!";
    
    // Draw multiple glow layers for depth
    glowLayers.forEach(layer => {
      ctx.shadowColor = layer.color;
      ctx.shadowBlur = layer.blur;
      ctx.shadowOffsetX = layer.offset;
      ctx.shadowOffsetY = layer.offset;
      ctx.fillText(mainText, width / 2, height / 2 - 15);
    });
    
    // Draw the final crisp text on top
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.fillText(mainText, width / 2, height / 2 - 15);
    
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
        
        // Ensure completion callback is called after state updates
        setTimeout(() => {
          onComplete?.();
        }, 50); // Small delay to ensure state is updated
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
    lastPointRef.current = null; // Reset for new stroke
    
    // Initialize audio context on first touch (required for mobile)
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume().catch(() => {}); // Silent fail if already running
        }
      } catch (error) {
        // Silent fail - audio context may already exist or be unsupported
      }
    }
    
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
      {/* Main scratch container */}
      <div
        className={cn(
          "relative overflow-hidden rounded-none transition-all duration-300",
          isMobile ? "shadow-2xl" : "shadow-xl hover:shadow-2xl hover:shadow-violet-500/20",
          isScratching && isMobile ? "scale-[1.02] shadow-3xl shadow-violet-400/30" : "",
          "bg-gradient-to-br from-violet-900/30 to-violet-800/30 backdrop-blur-sm"
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

    </div>
  );
}
