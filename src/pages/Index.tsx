import React, { useState } from 'react';
import { ImageReveal } from '@/components/ImageReveal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AdminPanel } from '@/components/AdminPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Zap, Gift } from 'lucide-react';
import hiddenTreasure from '@/assets/hidden-treasure.jpg';

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
    <div className="min-h-screen bg-background relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 left-4 z-40">
        <ThemeToggle />
      </div>
      
      {/* Admin Panel */}
      <AdminPanel
        onImageChange={setCurrentImage}
        onSettingsChange={setRevealSettings}
        currentSettings={revealSettings}
      />
      
      {/* Header */}
      <div className="relative overflow-hidden pt-16 pb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 animate-reveal-scale">
            <Sparkles className="w-4 h-4 text-primary animate-spin" />
            <span className="text-sm font-medium text-primary">Premium Reveal Experience</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient-primary">
            Image Reveal
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gradient-secondary">
            Platform
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Scratch, swipe, and discover hidden treasures! An interactive experience 
            that brings mystery and excitement to image reveals.
          </p>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="bg-card/50 border-card-border hover-glow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Interactive Scratch</h3>
                <p className="text-sm text-muted-foreground">
                  Intuitive touch and mouse controls for seamless revealing
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-card-border hover-glow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary-glow rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-6 h-6 text-background" />
                </div>
                <h3 className="font-semibold mb-2">Hidden Surprises</h3>
                <p className="text-sm text-muted-foreground">
                  Discover amazing images and celebrate with confetti
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-card-border hover-glow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Share & Download</h3>
                <p className="text-sm text-muted-foreground">
                  Share your discoveries and download revealed images
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Main Reveal Area */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <ImageReveal
            hiddenImageSrc={currentImage}
            revealThreshold={revealSettings.revealThreshold}
            brushSize={revealSettings.brushSize}
            onRevealComplete={handleRevealComplete}
          />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">
            Built with ❤️ using React, Tailwind CSS, and ShadCN UI
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Perfect for events, games, and interactive experiences
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
