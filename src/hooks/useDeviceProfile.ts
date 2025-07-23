import { useState, useEffect, useCallback } from 'react';
import { 
  DeviceCapabilities, 
  DeviceProfile, 
  QualitySettings,
  detectAndProfileDevice,
  getDeviceProfileById,
  DEVICE_PROFILES
} from '../utils/deviceDetection';

export interface UseDeviceProfileReturn {
  // Current state
  capabilities: DeviceCapabilities | null;
  currentProfile: DeviceProfile | null;
  qualitySettings: QualitySettings | null;
  deviceScore: number;
  isLoading: boolean;
  
  // Available profiles
  availableProfiles: DeviceProfile[];
  
  // Actions
  refreshProfile: () => void;
  setManualProfile: (profileId: string) => void;
  resetToAutoProfile: () => void;
  
  // State flags
  isManualOverride: boolean;
  autoSelectedProfileId: string | null;
}

/**
 * Hook for device detection and performance profiling
 * Provides automatic device detection with manual override capabilities
 */
export function useDeviceProfile(): UseDeviceProfileReturn {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [currentProfile, setCurrentProfile] = useState<DeviceProfile | null>(null);
  const [deviceScore, setDeviceScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
  const [autoSelectedProfileId, setAutoSelectedProfileId] = useState<string | null>(null);

  // Detect device capabilities and select profile
  const detectDevice = useCallback(() => {
    setIsLoading(true);
    
    try {
      const result = detectAndProfileDevice();
      
      setCapabilities(result.capabilities);
      setDeviceScore(result.score);
      setAutoSelectedProfileId(result.profile.id);
      
      // Only update current profile if not manually overridden
      if (!isManualOverride) {
        setCurrentProfile(result.profile);
      }
      
      console.log('Device detection completed:', {
        score: result.score,
        profileId: result.profile.id,
        capabilities: result.capabilities
      });
      
    } catch (error) {
      console.error('Device detection failed:', error);
      
      // Fallback to mid-range profile
      const fallbackProfile = DEVICE_PROFILES[1];
      setCurrentProfile(fallbackProfile);
      setAutoSelectedProfileId(fallbackProfile.id);
    } finally {
      setIsLoading(false);
    }
  }, [isManualOverride]);

  // Initialize device detection on mount
  useEffect(() => {
    detectDevice();
  }, [detectDevice]);

  // Refresh profile (re-run detection)
  const refreshProfile = useCallback(() => {
    setIsManualOverride(false);
    detectDevice();
  }, [detectDevice]);

  // Set manual profile override
  const setManualProfile = useCallback((profileId: string) => {
    const profile = getDeviceProfileById(profileId);
    if (profile) {
      setCurrentProfile(profile);
      setIsManualOverride(true);
      console.log('Manual profile override set:', profileId);
    } else {
      console.warn('Invalid profile ID:', profileId);
    }
  }, []);

  // Reset to automatic profile selection
  const resetToAutoProfile = useCallback(() => {
    setIsManualOverride(false);
    if (autoSelectedProfileId) {
      const autoProfile = getDeviceProfileById(autoSelectedProfileId);
      if (autoProfile) {
        setCurrentProfile(autoProfile);
        console.log('Reset to auto profile:', autoSelectedProfileId);
      }
    }
  }, [autoSelectedProfileId]);

  return {
    // Current state
    capabilities,
    currentProfile,
    qualitySettings: currentProfile?.qualitySettings || null,
    deviceScore,
    isLoading,
    
    // Available profiles
    availableProfiles: DEVICE_PROFILES,
    
    // Actions
    refreshProfile,
    setManualProfile,
    resetToAutoProfile,
    
    // State flags
    isManualOverride,
    autoSelectedProfileId
  };
}