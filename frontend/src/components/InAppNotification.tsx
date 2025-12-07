'use client';

import { useState, useEffect, useCallback } from 'react';

export interface InAppNotificationData {
  id: string;
  title: string;
  message: string;
  type: 'goal' | 'assist' | 'yellow' | 'red' | 'substitution' | 'bonus' | 'matchEnd' | 'info';
  timestamp: number;
}

interface InAppNotificationProps {
  notification: InAppNotificationData;
  onDismiss: (id: string) => void;
}

const TYPE_CONFIG = {
  goal: { icon: '⚽', bg: 'from-green-500 to-emerald-600', sound: true },
  assist: { icon: '🅰️', bg: 'from-blue-500 to-cyan-600', sound: true },
  yellow: { icon: '🟨', bg: 'from-yellow-500 to-amber-600', sound: false },
  red: { icon: '🟥', bg: 'from-red-500 to-rose-600', sound: true },
  substitution: { icon: '🔄', bg: 'from-orange-500 to-amber-600', sound: false },
  bonus: { icon: '⭐', bg: 'from-purple-500 to-violet-600', sound: false },
  matchEnd: { icon: '🏁', bg: 'from-gray-500 to-slate-600', sound: false },
  info: { icon: 'ℹ️', bg: 'from-blue-500 to-indigo-600', sound: false },
};

function InAppNotificationToast({ notification, onDismiss }: InAppNotificationProps) {
  const [isExiting, setIsExiting] = useState(false);
  const config = TYPE_CONFIG[notification.type];

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(notification.id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(notification.id), 300);
  };

  return (
    <div
      className={`w-full max-w-sm bg-gradient-to-r ${config.bg} rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
    >
      <div className="p-4 flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white">{notification.title}</div>
          <div className="text-sm text-white/80 mt-0.5">{notification.message}</div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-black/20">
        <div 
          className="h-full bg-white/40 animate-shrink-width"
          style={{ animationDuration: '5s' }}
        />
      </div>
    </div>
  );
}

// Notification container that manages multiple notifications
interface NotificationContainerProps {
  notifications: InAppNotificationData[];
  onDismiss: (id: string) => void;
}

export function NotificationContainer({ notifications, onDismiss }: NotificationContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.slice(0, 5).map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <InAppNotificationToast notification={notification} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

// Hook for managing in-app notifications
export function useInAppNotifications() {
  const [notifications, setNotifications] = useState<InAppNotificationData[]>([]);

  const addNotification = useCallback((
    title: string,
    message: string,
    type: InAppNotificationData['type'] = 'info'
  ) => {
    const notification: InAppNotificationData = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      type,
      timestamp: Date.now(),
    };
    setNotifications((prev) => [...prev, notification]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
  };
}

export default InAppNotificationToast;

