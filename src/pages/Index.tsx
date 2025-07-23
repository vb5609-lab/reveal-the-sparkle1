import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageRevealMagicUI } from '@/components/ImageRevealMagicUI';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AdminPanel } from '@/components/AdminPanel';
import { Sparkles } from 'lucide-react';
import hiddenTreasure from '@/assets/hidden-treasure.jpg';
import d3Logo from '@/assets/d3logo.png';

const Index = () => {
  const [currentImage, setCurrentImage] = useState(hiddenTreasure);
  const [revealSettings, setRevealSettings] = useState({
    brushSize: 40,
    revealThreshold: 75
  });

  const handleRevealComplete = () => {
    console.log('🎉 Image fully revealed!');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Beautiful floating background elements for light theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 floating" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-25 floating" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-15 floating" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-20 floating" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Theme Toggle with enhanced design */}
      <motion.div 
        className="absolute top-4 left-4 z-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="glass-card p-2">
          <ThemeToggle />
        </div>
      </motion.div>
      
      {/* Admin Panel */}
      <AdminPanel
        onImageChange={setCurrentImage}
        onSettingsChange={setRevealSettings}
        currentSettings={revealSettings}
      />
      
      {/* Enhanced Header with beautiful light theme design */}
      <motion.div 
        className="relative overflow-hidden pt-16 pb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Beautiful gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 gradient-overlay" />
        
        {/* Sparkling particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-secondary/40 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-primary/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-secondary/35 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative">
          {/* Enhanced Logo with beautiful styling */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
              <img 
                src={d3Logo} 
                alt="D3 Logo" 
                className="relative h-16 w-auto md:h-20 object-contain hover-scale drop-shadow-lg"
              />
            </div>
          </motion.div>
          
          {/* Enhanced Title with creative styling */}
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6 text-gradient-primary relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <span className="relative inline-block">
              Scratch & Reveal
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            </span>
            <div className="absolute top-0 right-0 text-2xl animate-bounce">✨</div>
          </motion.h1>
          
          {/* Beautiful description with glass card effect */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="glass-card px-8 py-4 max-w-xl">
              <p className="text-lg text-muted-foreground">
                Scratch to discover hidden treasures!
                <span className="ml-2 text-primary">🎨</span>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Enhanced Main Reveal Area with beautiful card design */}
      <motion.div 
        className="container mx-auto px-4 pb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Beautiful background glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl blur-xl opacity-50"></div>
            
            {/* Main card with glass morphism */}
            <div className="relative glass-card p-6 md:p-8">
              <ImageRevealMagicUI
                hiddenImageSrc={currentImage}
                revealThreshold={revealSettings.revealThreshold}
                onRevealComplete={handleRevealComplete}
              />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-70 animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-60 animate-ping"></div>
          </div>
        </div>
      </motion.div>
      
      {/* Beautiful footer section with creative elements */}
      <motion.div 
        className="container mx-auto px-4 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="text-center">
          <div className="glass-card inline-block px-6 py-3 mx-auto">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              Made with <span className="text-red-500 animate-pulse">❤️</span> by D3 team
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
