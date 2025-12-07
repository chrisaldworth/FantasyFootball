// Push Notification Service for background notifications

import { api } from './api';

// VAPID public key - you'll need to generate this
// For now, we'll use a placeholder that can be replaced
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

// Check if push notifications are supported
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Convert VAPID key to ArrayBuffer for applicationServerKey
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// Get existing push subscription
export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

// Subscribe to push notifications
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return null;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('VAPID public key not configured');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Subscribe to push
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      console.log('Push subscription created:', subscription);
    }

    // Send subscription to backend
    await sendSubscriptionToBackend(subscription);

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const subscription = await getExistingSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      await removeSubscriptionFromBackend(subscription);
      console.log('Unsubscribed from push');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return false;
  }
}

// Send subscription to backend for storage
async function sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
  try {
    await api.post('/api/notifications/subscribe', {
      subscription: subscription.toJSON(),
    });
    console.log('Subscription sent to backend');
  } catch (error) {
    console.error('Failed to send subscription to backend:', error);
  }
}

// Remove subscription from backend
async function removeSubscriptionFromBackend(subscription: PushSubscription): Promise<void> {
  try {
    await api.post('/api/notifications/unsubscribe', {
      endpoint: subscription.endpoint,
    });
    console.log('Subscription removed from backend');
  } catch (error) {
    console.error('Failed to remove subscription from backend:', error);
  }
}

// Request notification permission
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return 'denied';
  
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    // Register service worker and subscribe
    await registerServiceWorker();
    await subscribeToPush();
  }
  
  return permission;
}

