import React from 'react';
import { useDeviceProfile } from '../hooks/useDeviceProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Cpu, 
  MemoryStick, 
  Wifi, 
  Settings,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

/**
 * Demo component to showcase device detection and profiling capabilities
 */
export function DeviceProfileDemo() {
  const {
    capabilities,
    currentProfile,
    qualitySettings,
    deviceScore,
    isLoading,
    availableProfiles,
    refreshProfile,
    setManualProfile,
    resetToAutoProfile,
    isManualOverride,
    autoSelectedProfileId
  } = useDeviceProfile();

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Detecting Device Capabilities...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!capabilities || !currentProfile) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Device Detection Failed</CardTitle>
          <CardDescription>
            Unable to detect device capabilities. Please refresh the page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refreshProfile} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Detection
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getDeviceIcon = () => {
    if (capabilities.isMobile) return <Smartphone className="h-5 w-5" />;
    if (capabilities.isTablet) return <Tablet className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProfileBadgeVariant = (profileId: string) => {
    if (profileId === currentProfile.id) {
      return isManualOverride ? 'default' : 'secondary';
    }
    return 'outline';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Device Detection & Performance Profiling
          </CardTitle>
          <CardDescription>
            Automatic device capability detection with performance profile selection
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Capabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getDeviceIcon()}
              Device Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Device Type */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Device Type:</span>
              <Badge variant="secondary">
                {capabilities.isMobile ? 'Mobile' : 
                 capabilities.isTablet ? 'Tablet' : 'Desktop'}
              </Badge>
            </div>

            {/* Hardware Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  CPU Cores:
                </span>
                <span className="text-sm font-mono">{capabilities.hardwareConcurrency}</span>
              </div>
              
              {capabilities.deviceMemory && (
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <MemoryStick className="h-4 w-4" />
                    Memory:
                  </span>
                  <span className="text-sm font-mono">{capabilities.deviceMemory} GB</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm">Screen Resolution:</span>
                <span className="text-sm font-mono">
                  {capabilities.screenWidth} × {capabilities.screenHeight}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Pixel Ratio:</span>
                <span className="text-sm font-mono">{capabilities.pixelRatio}x</span>
              </div>

              {capabilities.connectionEffectiveType && (
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    Connection:
                  </span>
                  <Badge variant="outline">
                    {capabilities.connectionEffectiveType.toUpperCase()}
                  </Badge>
                </div>
              )}
            </div>

            <Separator />

            {/* Performance Score */}
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">
                <span className={getScoreColor(deviceScore)}>
                  {deviceScore}/100
                </span>
              </div>
              <div className="text-sm text-muted-foreground">Performance Score</div>
            </div>
          </CardContent>
        </Card>

        {/* Current Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Profile</span>
              {isManualOverride && (
                <Badge variant="outline">Manual Override</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">{currentProfile.name}</h3>
              <p className="text-sm text-muted-foreground">
                {isManualOverride ? 'Manually Selected' : 'Auto-Selected'}
              </p>
            </div>

            <Separator />

            {/* Quality Settings */}
            <div className="space-y-3">
              <h4 className="font-medium">Quality Settings</h4>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Brush Smoothness:</span>
                  <div className="font-mono">{(qualitySettings?.brushSmoothness * 100).toFixed(0)}%</div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Interpolation Steps:</span>
                  <div className="font-mono">{qualitySettings?.interpolationSteps}</div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Particle Count:</span>
                  <div className="font-mono">{qualitySettings?.particleCount}</div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Shadow Effects:</span>
                  <div className="flex items-center gap-1">
                    {qualitySettings?.shadowEffects ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <span className="text-red-600">✕</span>
                    )}
                    <span>{qualitySettings?.shadowEffects ? 'On' : 'Off'}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Performance Thresholds */}
            <div className="space-y-2">
              <h4 className="font-medium">Performance Thresholds</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min FPS:</span>
                  <span className="font-mono">{currentProfile.thresholds.minFps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Frame Time:</span>
                  <span className="font-mono">{currentProfile.thresholds.maxFrameTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Memory:</span>
                  <span className="font-mono">{currentProfile.thresholds.maxMemory}MB</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Available Profiles</CardTitle>
          <CardDescription>
            {isManualOverride 
              ? `Auto-selected: ${autoSelectedProfileId} | Currently using manual override`
              : 'Profile automatically selected based on device capabilities'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {availableProfiles.map((profile) => (
              <Button
                key={profile.id}
                variant={getProfileBadgeVariant(profile.id) === 'outline' ? 'outline' : 'default'}
                size="sm"
                onClick={() => setManualProfile(profile.id)}
                className="flex items-center gap-2"
              >
                {profile.id === currentProfile.id && (
                  <CheckCircle className="h-3 w-3" />
                )}
                {profile.name}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={refreshProfile} 
              variant="outline" 
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Detection
            </Button>
            
            {isManualOverride && (
              <Button 
                onClick={resetToAutoProfile} 
                variant="outline" 
                size="sm"
              >
                Reset to Auto
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}