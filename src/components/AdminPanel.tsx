import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, Settings, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface AdminPanelProps {
  onImageChange: (imageSrc: string) => void;
  onSettingsChange: (settings: { brushSize: number; revealThreshold: number }) => void;
  currentSettings: { brushSize: number; revealThreshold: number };
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onImageChange,
  onSettingsChange,
  currentSettings
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [localSettings, setLocalSettings] = useState(currentSettings);
  const [isOpen, setIsOpen] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageChange(result);
      toast.success('Image uploaded successfully! 🎨');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
      onImageChange(imageUrl);
      setImageUrl('');
      toast.success('Image URL loaded successfully! 🌐');
    } catch {
      toast.error('Please enter a valid image URL');
    }
  };

  const handleSettingsUpdate = () => {
    onSettingsChange(localSettings);
    toast.success('Settings updated! ⚙️');
  };

  const resetSettings = () => {
    const defaultSettings = { brushSize: 40, revealThreshold: 75 };
    setLocalSettings(defaultSettings);
    onSettingsChange(defaultSettings);
    toast.info('Settings reset to default! 🔄');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed top-24 right-4 z-40 hover-scale bg-card/80 backdrop-blur-sm border-[#004aad]/30 hover:border-[#004aad]/50 transition-all duration-300"
      >
        <Settings className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-card-border hover-glow">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gradient-primary">
              <Sparkles className="w-5 h-5" />
              Admin Panel
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="hover-scale"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Change Hidden Image</Label>
            
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-xs text-muted-foreground">
                Upload from device
              </Label>
              <div className="relative">
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer file:cursor-pointer"
                />
                <Upload className="absolute right-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="image-url" className="text-xs text-muted-foreground">
                Or enter image URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleUrlSubmit} size="sm" className="hover-scale">
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Settings Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Reveal Settings</Label>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="brush-size" className="text-xs text-muted-foreground">
                  Brush Size: {localSettings.brushSize}px
                </Label>
                <Input
                  id="brush-size"
                  type="range"
                  min="10"
                  max="100"
                  value={localSettings.brushSize}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    brushSize: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="reveal-threshold" className="text-xs text-muted-foreground">
                  Reveal Threshold: {localSettings.revealThreshold}%
                </Label>
                <Input
                  id="reveal-threshold"
                  type="range"
                  min="50"
                  max="95"
                  value={localSettings.revealThreshold}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    revealThreshold: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleSettingsUpdate}
                className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover-scale"
              >
                Apply Settings
              </Button>
              <Button
                onClick={resetSettings}
                variant="outline"
                className="hover-scale"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};