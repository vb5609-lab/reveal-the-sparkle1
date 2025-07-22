import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Check for saved theme preference or default to 'dark'
    if (typeof window === 'undefined') return;
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    updateTheme(initialTheme);
  }, []);

  const updateTheme = (newTheme: 'light' | 'dark') => {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(newTheme);
    
    // Save to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    updateTheme(newTheme);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="hover-scale bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 group relative overflow-hidden"
    >
      {/* Beautiful gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative flex items-center gap-2">
        {theme === 'light' ? (
          <>
            <Moon className="w-4 h-4 transition-transform group-hover:rotate-12" />
            <span className="text-xs font-medium hidden sm:inline">Dark</span>
          </>
        ) : (
          <>
            <Sun className="w-4 h-4 transition-transform group-hover:rotate-12 text-yellow-500" />
            <span className="text-xs font-medium hidden sm:inline">Light</span>
          </>
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};