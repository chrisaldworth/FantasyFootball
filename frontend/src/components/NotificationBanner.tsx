'use client';

import { useState, useEffect } from 'react';
import { 
  isPushSupported, 
  requestNotificationPermission, 
  registerServiceWorker,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  checkNotificationPermission 
} from '@/lib/push-notifications';

interface NotificationBannerProps {
  token: string;
}

export default function NotificationBanner({ token }: NotificationBannerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsSupported(isPushSupported());
      const perm = await checkNotificationPermission();
      setPermission(perm);
      
      // Check if already subscribed
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    };
    init();
  }, []);

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      // Request permission
      const perm = await requestNotificationPermission();
      setPermission(perm);
      
      if (perm === 'granted') {
        // Register service worker
        await registerServiceWorker();
        
        // Subscribe to push
        const subscription = await subscribeToPushNotifications(token);
        setIsSubscribed(!!subscription);
        
        if (subscription) {
          setShowBanner(false);
        }
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);
    try {
      await unsubscribeFromPushNotifications(token);
      setIsSubscribed(false);
    } catch (error) {
      console.error('Failed to disable notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show if not supported or already dismissed
  if (!isSupported || !showBanner) {
    return null;
  }

  // Already subscribed - show status
  if (isSubscribed) {
    return (
      <div className="bg-green-900/50 border border-green-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="text-green-300 font-medium">Notifications Active</p>
              <p className="text-green-400/70 text-sm">
                You'll receive alerts for goals, assists, cards & more
              </p>
            </div>
          </div>
          <button
            onClick={handleDisable}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm bg-red-600/20 hover:bg-red-600/40 
                       text-red-300 rounded-lg transition-colors border border-red-500/30"
          >
            {isLoading ? 'Disabling...' : 'Disable'}
          </button>
        </div>
      </div>
    );
  }

  // Permission denied
  if (permission === 'denied') {
    return (
      <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-yellow-300 font-medium">Notifications Blocked</p>
            <p className="text-yellow-400/70 text-sm">
              Please enable notifications in your browser settings to receive alerts
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show enable prompt
  return (
    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <div>
            <p className="text-purple-200 font-medium">Enable Live Notifications</p>
            <p className="text-purple-300/70 text-sm">
              Get instant alerts when your players score, assist, or get carded
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBanner(false)}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Later
          </button>
          <button
            onClick={handleEnable}
            disabled={isLoading}
            className="px-4 py-1.5 text-sm bg-purple-600 hover:bg-purple-500 
                       text-white rounded-lg transition-colors font-medium"
          >
            {isLoading ? 'Enabling...' : 'Enable'}
          </button>
        </div>
      </div>
    </div>
  );
}

