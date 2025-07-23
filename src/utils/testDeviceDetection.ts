/**
 * Simple test script to verify device detection functionality
 * This can be run in the browser console to test the implementation
 */

import { detectAndProfileDevice, DEVICE_PROFILES } from './deviceDetection';

export function runDeviceDetectionTest() {
  console.log('🔍 Running Device Detection Test...\n');
  
  try {
    // Test device detection
    const result = detectAndProfileDevice();
    
    console.log('✅ Device Detection Results:');
    console.log('📱 Device Capabilities:', result.capabilities);
    console.log('⚡ Performance Score:', result.score);
    console.log('🎯 Selected Profile:', result.profile);
    console.log('');
    
    // Test profile validation
    console.log('📋 Available Profiles:');
    DEVICE_PROFILES.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.name} (${profile.id})`);
      console.log('   Quality Settings:', profile.qualitySettings);
      console.log('   Thresholds:', profile.thresholds);
      console.log('');
    });
    
    // Test device type detection
    const { capabilities } = result;
    console.log('🖥️ Device Type Analysis:');
    console.log(`   Mobile: ${capabilities.isMobile}`);
    console.log(`   Tablet: ${capabilities.isTablet}`);
    console.log(`   Desktop: ${capabilities.isDesktop}`);
    console.log(`   Touch Points: ${capabilities.maxTouchPoints}`);
    console.log(`   Screen: ${capabilities.screenWidth}x${capabilities.screenHeight}`);
    console.log('');
    
    // Test API availability
    console.log('🔧 API Availability:');
    console.log(`   Performance API: ${capabilities.hasPerformanceAPI}`);
    console.log(`   Memory API: ${capabilities.hasMemoryAPI}`);
    console.log(`   Connection API: ${capabilities.hasConnectionAPI}`);
    console.log('');
    
    // Test performance characteristics
    if (capabilities.connectionEffectiveType) {
      console.log(`🌐 Connection: ${capabilities.connectionEffectiveType} (${capabilities.connectionType})`);
    }
    
    if (capabilities.deviceMemory) {
      console.log(`💾 Device Memory: ${capabilities.deviceMemory} GB`);
    }
    
    console.log(`🔧 CPU Cores: ${capabilities.hardwareConcurrency}`);
    console.log(`📺 Pixel Ratio: ${capabilities.pixelRatio}`);
    
    console.log('\n✅ Device Detection Test Completed Successfully!');
    
    return result;
    
  } catch (error) {
    console.error('❌ Device Detection Test Failed:', error);
    throw error;
  }
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testDeviceDetection = runDeviceDetectionTest;
}