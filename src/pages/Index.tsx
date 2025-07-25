import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageRevealMagicUI } from '@/components/ImageRevealMagicUI';
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
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#001122' }}>
      

      
      {/* Admin Panel */}
      <AdminPanel
        onImageChange={setCurrentImage}
        onSettingsChange={setRevealSettings}
        currentSettings={revealSettings}
      />
      
      {/* Enhanced Header with beautiful light theme design - Mobile optimized */}
      <motion.div 
        className="relative overflow-hidden pt-12 sm:pt-16 pb-8 sm:pb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4 sm:gap-0">
            {/* Enhanced Logo positioned to the left - Mobile centered */}
            <motion.div
              className="flex-shrink-0 order-1 sm:order-none -mt-2 sm:-mt-4 -ml-0 sm:-ml-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                <img 
                  src={d3Logo} 
                  alt="D3 Logo" 
                  className="relative h-12 sm:h-14 md:h-16 w-auto object-contain hover-scale drop-shadow-lg"
                />
              </div>
            </motion.div>
            
            {/* Enhanced Title with new text and custom gradient - Mobile centered */}
            <motion.div 
              className="flex-1 text-center order-2 sm:order-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h1 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 relative px-2"
                style={{
                  background: `linear-gradient(135deg, #3b82f6, #06b6d4, #10b981, #8b5cf6)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                INTRODUCING D3 COMMUNITY MASCOT
              </h1>
            </motion.div>
          </div>
          

        </div>
      </motion.div>
      
      {/* Enhanced Main Reveal Area with beautiful card design - Mobile optimized */}
      <motion.div 
        className="w-full px-4 sm:px-6 pb-8 sm:pb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <div className="w-full max-w-2xl mx-auto">
          <div className="relative">
            {/* Beautiful background glow - Mobile optimized */}
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl sm:rounded-3xl blur-lg sm:blur-xl opacity-30 sm:opacity-50"></div>
            
            {/* Main card with glass morphism */}
            <div className="relative">
              <ImageRevealMagicUI
                hiddenImageSrc={currentImage}
                revealThreshold={revealSettings.revealThreshold}
                onRevealComplete={handleRevealComplete}
              />
            </div>
            
            {/* Decorative elements - Hidden on very small screens */}
            <div className="hidden sm:block absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-60 animate-ping"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
