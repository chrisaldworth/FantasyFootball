'use client';

import { useState, useEffect } from 'react';
import {
  isNotificationSupported,
  isIOS,
  getNotificationPermission,
  requestNotificationPermission,
  getNotificationSettings,
  saveNotificationSettings,
  showNotification,
  type NotificationSettings as NotificationSettingsType,
} from '@/lib/notifications';

interface NotificationSettingsProps {
  onClose: () => void;
}

export default function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const [supported, setSupported] = useState(true);
  const [isiOSDevice, setIsiOSDevice] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [settings, setSettings] = useState<NotificationSettingsType>({
    enabled: true,
    goals: true,
    assists: true,
    redCards: true,
    matchEnd: true,
    bonusPoints: true,
    useInApp: true,
  });
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    setSupported(isNotificationSupported());
    setIsiOSDevice(isIOS());
    setPermission(getNotificationPermission());
    setSettings(getNotificationSettings());
  }, []);

  const handleRequestPermission = async () => {
    setRequesting(true);
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermission());
    setRequesting(false);
    
    if (granted) {
      // Show test notification
      showNotification('🎉 Notifications Enabled!', {
        body: 'You\'ll now receive updates about your FPL team',
        tag: 'test-notification',
      });
    }
  };

  const handleToggle = (key: keyof NotificationSettingsType) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleTestNotification = () => {
    showNotification('⚽ Test: Salah scored!', {
      body: 'M. Salah has scored for Liverpool! (+5 pts)',
      tag: 'test',
    });
  };

  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    disabled = false 
  }: { 
    enabled: boolean; 
    onChange: () => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-[var(--pl-green)]' : 'bg-[var(--pl-dark)]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
          enabled ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-hidden glass rounded-t-2xl sm:rounded-2xl animate-slide-up sm:m-4 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-white/10 bg-[var(--pl-card)]">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <span className="text-white text-xl leading-none">×</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--pl-pink)] to-[var(--pl-purple)] flex items-center justify-center text-2xl">
              🔔
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Notifications</h2>
              <p className="text-sm text-[var(--pl-text-muted)]">
                Get alerts about your team
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* iOS Device Notice */}
          {isiOSDevice && (
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-400 font-medium">
                <span>📱</span>
                iOS Device Detected
              </div>
              <p className="text-sm text-[var(--pl-text-muted)] mt-1">
                iOS browsers don't support web notifications. We'll show <strong>in-app notifications</strong> instead - 
                they appear as toast messages at the top of the screen.
              </p>
              <p className="text-sm text-[var(--pl-cyan)] mt-2">
                💡 For push notifications, install our native app (coming soon)!
              </p>
            </div>
          )}

          {/* Browser Support Check (non-iOS) */}
          {!supported && !isiOSDevice && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-400 font-medium">
                <span>⚠️</span>
                Browser Notifications Not Supported
              </div>
              <p className="text-sm text-[var(--pl-text-muted)] mt-1">
                Your browser doesn't support notifications. We'll use in-app notifications instead.
              </p>
            </div>
          )}

          {/* Permission Status - only show for supported browsers */}
          {supported && !isiOSDevice && (
            <div className="bg-[var(--pl-dark)]/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Browser Permission</div>
                  <div className="text-sm text-[var(--pl-text-muted)]">
                    {permission === 'granted' && '✅ Notifications allowed'}
                    {permission === 'denied' && '❌ Notifications blocked'}
                    {permission === 'default' && '⏳ Permission not requested'}
                  </div>
                </div>
                {permission !== 'granted' && (
                  <button
                    onClick={handleRequestPermission}
                    disabled={requesting || permission === 'denied'}
                    className="px-4 py-2 rounded-lg bg-[var(--pl-green)] text-black font-medium disabled:opacity-50"
                  >
                    {requesting ? 'Requesting...' : permission === 'denied' ? 'Blocked' : 'Enable'}
                  </button>
                )}
              </div>
              
              {permission === 'denied' && (
                <p className="text-xs text-[var(--pl-text-muted)] mt-2">
                  To enable notifications, click the 🔒 icon in your browser's address bar and allow notifications.
                </p>
              )}
            </div>
          )}

          {/* In-App Notification Status for iOS/unsupported */}
          {(isiOSDevice || !supported) && (
            <div className="bg-[var(--pl-dark)]/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">In-App Notifications</div>
                  <div className="text-sm text-[var(--pl-text-muted)]">
                    ✅ Always available - no permission needed
                  </div>
                </div>
                <span className="text-2xl">📲</span>
              </div>
            </div>
          )}

          {/* Notification Types - show for everyone */}
          {(supported && permission === 'granted') || isiOSDevice || !supported ? (
            <>
              {/* Master Toggle */}
              <div className="bg-[var(--pl-dark)]/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enable Notifications</div>
                    <div className="text-sm text-[var(--pl-text-muted)]">
                      Master switch for all notifications
                    </div>
                  </div>
                  <ToggleSwitch 
                    enabled={settings.enabled} 
                    onChange={() => handleToggle('enabled')} 
                  />
                </div>
              </div>

              {/* Individual Settings */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[var(--pl-text-muted)]">
                  NOTIFICATION TYPES
                </h3>
                
                <div className="bg-[var(--pl-dark)]/50 rounded-xl divide-y divide-white/5">
                  {[
                    { key: 'goals', icon: '⚽', label: 'Goals', desc: 'When your player scores' },
                    { key: 'assists', icon: '🅰️', label: 'Assists', desc: 'When your player assists' },
                    { key: 'redCards', icon: '🟥', label: 'Red Cards', desc: 'When your player is sent off' },
                    { key: 'matchEnd', icon: '🏁', label: 'Match End', desc: 'Final score and your points' },
                    { key: 'bonusPoints', icon: '⭐', label: 'Bonus Points', desc: 'When bonus points are confirmed' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-[var(--pl-text-muted)]">{item.desc}</div>
                        </div>
                      </div>
                      <ToggleSwitch 
                        enabled={settings[item.key as keyof NotificationSettingsType] as boolean}
                        onChange={() => handleToggle(item.key as keyof NotificationSettingsType)}
                        disabled={!settings.enabled}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Button */}
              <button
                onClick={handleTestNotification}
                disabled={!settings.enabled}
                className="w-full py-3 rounded-xl bg-[var(--pl-purple)]/30 border border-[var(--pl-purple)]/50 text-[var(--pl-purple)] font-medium hover:bg-[var(--pl-purple)]/40 transition-colors disabled:opacity-50"
              >
                🧪 Send Test Notification
              </button>
            </>
          ) : null}

          {/* Info */}
          <div className="bg-[var(--pl-dark)]/30 rounded-xl p-4 text-sm text-[var(--pl-text-muted)]">
            <p className="font-medium text-white mb-2">ℹ️ How it works</p>
            <p>
              When you have the app open during live matches, we'll monitor your players 
              and send you instant notifications when they score, assist, or receive cards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

