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
      
      {/* Enhanced Header with beautiful light theme design */}
      <motion.div 
        className="relative overflow-hidden pt-16 pb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        
        <div className="container mx-auto px-4 relative">
          <div className="flex items-start justify-between">
            {/* Enhanced Logo positioned to the left and moved up */}
            <motion.div
              className="flex-shrink-0 -mt-4 -ml-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                <img 
                  src={d3Logo} 
                  alt="D3 Logo" 
                  className="relative h-14 w-auto md:h-16 object-contain hover-scale drop-shadow-lg"
                />
              </div>
            </motion.div>
            
            {/* Enhanced Title with new text and custom gradient */}
            <motion.div 
              className="flex-1 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 relative"
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
      
      {/* Enhanced Main Reveal Area with beautiful card design */}
      <motion.div 
        className="w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <div className="w-full">
          <div className="relative">
            {/* Beautiful background glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl blur-xl opacity-50"></div>
            
            {/* Main card with glass morphism */}
            <div className="relative">
              <ImageRevealMagicUI
                hiddenImageSrc={currentImage}
                revealThreshold={revealSettings.revealThreshold}
                onRevealComplete={handleRevealComplete}
              />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-60 animate-ping"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
