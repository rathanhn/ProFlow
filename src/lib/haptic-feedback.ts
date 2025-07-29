'use client';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' | 'impact';

interface HapticConfig {
  pattern: number | number[];
  fallbackDuration?: number;
}

const hapticPatterns: Record<HapticPattern, HapticConfig> = {
  light: { pattern: 10, fallbackDuration: 10 },
  medium: { pattern: 20, fallbackDuration: 20 },
  heavy: { pattern: 50, fallbackDuration: 50 },
  success: { pattern: [10, 50, 10], fallbackDuration: 70 },
  warning: { pattern: [20, 100, 20], fallbackDuration: 140 },
  error: { pattern: [50, 100, 50, 100, 50], fallbackDuration: 350 },
  selection: { pattern: 5, fallbackDuration: 5 },
  impact: { pattern: [30, 50, 30], fallbackDuration: 110 },
};

class HapticFeedback {
  private isSupported: boolean = false;
  private isEnabled: boolean = true;

  constructor() {
    this.checkSupport();
  }

  private checkSupport(): void {
    // Check for Vibration API support
    this.isSupported = 'vibrate' in navigator && typeof navigator.vibrate === 'function';
    
    // Additional check for mobile devices
    if (!this.isSupported) {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // Some mobile browsers might support vibration even if the initial check fails
      if (isMobile && 'vibrate' in navigator) {
        this.isSupported = true;
      }
    }
  }

  public isHapticSupported(): boolean {
    return this.isSupported;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public isHapticEnabled(): boolean {
    return this.isEnabled;
  }

  public vibrate(pattern: HapticPattern | number | number[]): boolean {
    if (!this.isSupported || !this.isEnabled) {
      return false;
    }

    try {
      let vibrationPattern: number | number[];

      if (typeof pattern === 'string') {
        const config = hapticPatterns[pattern];
        vibrationPattern = config.pattern;
      } else {
        vibrationPattern = pattern;
      }

      // Ensure the pattern is valid
      if (Array.isArray(vibrationPattern)) {
        // Filter out any invalid values and ensure all are positive numbers
        vibrationPattern = vibrationPattern
          .filter(duration => typeof duration === 'number' && duration >= 0)
          .map(duration => Math.min(duration, 5000)); // Cap at 5 seconds per vibration
      } else if (typeof vibrationPattern === 'number') {
        vibrationPattern = Math.max(0, Math.min(vibrationPattern, 5000));
      }

      return navigator.vibrate(vibrationPattern);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
      return false;
    }
  }

  public stop(): boolean {
    if (!this.isSupported) {
      return false;
    }

    try {
      return navigator.vibrate(0);
    } catch (error) {
      console.warn('Failed to stop haptic feedback:', error);
      return false;
    }
  }

  // Convenience methods for common patterns
  public light(): boolean {
    return this.vibrate('light');
  }

  public medium(): boolean {
    return this.vibrate('medium');
  }

  public heavy(): boolean {
    return this.vibrate('heavy');
  }

  public success(): boolean {
    return this.vibrate('success');
  }

  public warning(): boolean {
    return this.vibrate('warning');
  }

  public error(): boolean {
    return this.vibrate('error');
  }

  public selection(): boolean {
    return this.vibrate('selection');
  }

  public impact(): boolean {
    return this.vibrate('impact');
  }

  // Custom pattern builder
  public createPattern(durations: number[]): boolean {
    return this.vibrate(durations);
  }

  // Simulate different Android haptic feedback types
  public androidClick(): boolean {
    return this.vibrate([10]);
  }

  public androidLongPress(): boolean {
    return this.vibrate([0, 50]);
  }

  public androidKeyboardTap(): boolean {
    return this.vibrate([5]);
  }

  public androidNotification(): boolean {
    return this.vibrate([0, 100, 50, 100]);
  }

  public androidSwipeRefresh(): boolean {
    return this.vibrate([0, 20, 50, 20]);
  }

  public androidToggle(): boolean {
    return this.vibrate([0, 30]);
  }

  public androidError(): boolean {
    return this.vibrate([0, 100, 100, 100, 100, 100]);
  }
}

// Create a singleton instance
export const hapticFeedback = new HapticFeedback();

// React hook for haptic feedback
export const useHapticFeedback = () => {
  return {
    vibrate: hapticFeedback.vibrate.bind(hapticFeedback),
    light: hapticFeedback.light.bind(hapticFeedback),
    medium: hapticFeedback.medium.bind(hapticFeedback),
    heavy: hapticFeedback.heavy.bind(hapticFeedback),
    success: hapticFeedback.success.bind(hapticFeedback),
    warning: hapticFeedback.warning.bind(hapticFeedback),
    error: hapticFeedback.error.bind(hapticFeedback),
    selection: hapticFeedback.selection.bind(hapticFeedback),
    impact: hapticFeedback.impact.bind(hapticFeedback),
    stop: hapticFeedback.stop.bind(hapticFeedback),
    androidClick: hapticFeedback.androidClick.bind(hapticFeedback),
    androidLongPress: hapticFeedback.androidLongPress.bind(hapticFeedback),
    androidKeyboardTap: hapticFeedback.androidKeyboardTap.bind(hapticFeedback),
    androidNotification: hapticFeedback.androidNotification.bind(hapticFeedback),
    androidSwipeRefresh: hapticFeedback.androidSwipeRefresh.bind(hapticFeedback),
    androidToggle: hapticFeedback.androidToggle.bind(hapticFeedback),
    androidError: hapticFeedback.androidError.bind(hapticFeedback),
    isSupported: hapticFeedback.isHapticSupported(),
    isEnabled: hapticFeedback.isHapticEnabled(),
    setEnabled: hapticFeedback.setEnabled.bind(hapticFeedback),
  };
};

export default hapticFeedback;
