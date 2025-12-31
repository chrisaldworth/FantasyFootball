// iOS Native Push Notifications Service using Capacitor
// This provides native push notifications for iOS devices

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export interface IOSNotificationSettings {
  enabled: boolean;
  goals: boolean;
  assists: boolean;
  yellowCards: boolean;
  redCards: boolean;
  substitutions: boolean;
  matchEnd: boolean;
  bonusPoints: boolean;
}

const DEFAULT_SETTINGS: IOSNotificationSettings = {
  enabled: true,
  goals: true,
  assists: true,
  yellowCards: true,
  redCards: true,
  substitutions: true,
  matchEnd: true,
  bonusPoints: true,
};

// Check if running on iOS native app
export function isIOSNative(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

// Initialize push notifications for iOS
export async function initializePushNotifications(): Promise<boolean> {
  if (!isIOSNative()) {
    console.log('[iOS Notifications] Not running on iOS native app');
    return false;
  }

  try {
    // Request permission
    let permStatus = await PushNotifications.checkPermissions();
    
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[iOS Notifications] Permission not granted');
      return false;
    }

    // Register for push notifications
    await PushNotifications.register();

    // Set up event listeners
    PushNotifications.addListener('registration', (token) => {
      console.log('[iOS Notifications] Registration token:', token.value);
      // TODO: Send token to backend for push notification delivery
      // You'll need to implement an API endpoint to store device tokens
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('[iOS Notifications] Registration error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[iOS Notifications] Push notification received:', notification);
      // Trigger haptic feedback
      triggerHapticFeedback('light');
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[iOS Notifications] Push notification action:', action);
    });

    return true;
  } catch (error) {
    console.error('[iOS Notifications] Initialization error:', error);
    return false;
  }
}

// Trigger haptic feedback
export async function triggerHapticFeedback(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
  if (!isIOSNative()) return;

  try {
    const impactStyle = 
      style === 'light' ? ImpactStyle.Light :
      style === 'heavy' ? ImpactStyle.Heavy :
      ImpactStyle.Medium;
    
    await Haptics.impact({ style: impactStyle });
  } catch (error) {
    console.error('[iOS Haptics] Error:', error);
  }
}

// Get notification settings from secure storage
export async function getIOSNotificationSettings(): Promise<IOSNotificationSettings> {
  if (!isIOSNative()) return DEFAULT_SETTINGS;

  try {
    const { Preferences } = await import('@capacitor/preferences');
    const stored = await Preferences.get({ key: 'fpl_ios_notification_settings' });
    
    if (stored.value) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored.value) };
    }
  } catch (error) {
    console.error('[iOS Notifications] Error loading settings:', error);
  }

  return DEFAULT_SETTINGS;
}

// Save notification settings to secure storage
export async function saveIOSNotificationSettings(settings: IOSNotificationSettings): Promise<void> {
  if (!isIOSNative()) return;

  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({
      key: 'fpl_ios_notification_settings',
      value: JSON.stringify(settings),
    });
  } catch (error) {
    console.error('[iOS Notifications] Error saving settings:', error);
  }
}

// Note: For actual push notifications, you'll need to:
// 1. Set up APNs (Apple Push Notification service) certificates
// 2. Configure your backend to send push notifications via APNs
// 3. Store device tokens when users register
// 4. Send notifications from your backend when FPL events occur

// For now, this provides the infrastructure for push notifications
// Local notifications can be shown using Capacitor's Local Notifications plugin if needed


