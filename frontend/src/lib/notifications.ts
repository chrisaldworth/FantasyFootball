// Browser Notification Service for FPL Events

export interface NotificationSettings {
  enabled: boolean;
  goals: boolean;
  assists: boolean;
  redCards: boolean;
  matchEnd: boolean;
  bonusPoints: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  goals: true,
  assists: true,
  redCards: true,
  matchEnd: true,
  bonusPoints: true,
};

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Get current notification permission
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Notification permission was denied');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Get notification settings from localStorage
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  const stored = localStorage.getItem('fpl_notification_settings');
  if (stored) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

// Save notification settings
export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('fpl_notification_settings', JSON.stringify(settings));
}

// Show a notification
export function showNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  const defaultOptions: NotificationOptions = {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'fpl-notification',
    ...options,
  };

  return new Notification(title, defaultOptions);
}

// Notification types for different events
export function notifyGoal(playerName: string, teamName: string, points: number): void {
  const settings = getNotificationSettings();
  if (!settings.enabled || !settings.goals) return;

  showNotification(`⚽ GOAL! ${playerName}`, {
    body: `${playerName} has scored for ${teamName}! (+${points} pts)`,
    tag: `goal-${playerName}-${Date.now()}`,
    icon: '/icon-192.png',
  });
}

export function notifyAssist(playerName: string, teamName: string, points: number): void {
  const settings = getNotificationSettings();
  if (!settings.enabled || !settings.assists) return;

  showNotification(`🅰️ ASSIST! ${playerName}`, {
    body: `${playerName} provided an assist for ${teamName}! (+${points} pts)`,
    tag: `assist-${playerName}-${Date.now()}`,
  });
}

export function notifyRedCard(playerName: string, teamName: string): void {
  const settings = getNotificationSettings();
  if (!settings.enabled || !settings.redCards) return;

  showNotification(`🟥 RED CARD! ${playerName}`, {
    body: `${playerName} (${teamName}) has been sent off! (-3 pts)`,
    tag: `red-${playerName}-${Date.now()}`,
  });
}

export function notifyYellowCard(playerName: string, teamName: string): void {
  const settings = getNotificationSettings();
  if (!settings.enabled) return;

  showNotification(`🟨 Yellow Card: ${playerName}`, {
    body: `${playerName} (${teamName}) has been booked (-1 pt)`,
    tag: `yellow-${playerName}-${Date.now()}`,
  });
}

export function notifyMatchEnd(
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number,
  yourPoints: number
): void {
  const settings = getNotificationSettings();
  if (!settings.enabled || !settings.matchEnd) return;

  showNotification(`🏁 Full Time: ${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`, {
    body: `Your players earned ${yourPoints} points from this match`,
    tag: `match-end-${homeTeam}-${awayTeam}`,
  });
}

export function notifyBonusPoints(playerName: string, bonusPoints: number): void {
  const settings = getNotificationSettings();
  if (!settings.enabled || !settings.bonusPoints) return;

  showNotification(`⭐ Bonus Points: ${playerName}`, {
    body: `${playerName} earned ${bonusPoints} bonus points!`,
    tag: `bonus-${playerName}-${Date.now()}`,
  });
}

export function notifyPointsUpdate(totalPoints: number, change: number): void {
  const settings = getNotificationSettings();
  if (!settings.enabled) return;

  const emoji = change > 0 ? '📈' : '📉';
  showNotification(`${emoji} Points Update`, {
    body: `Your GW total: ${totalPoints} pts (${change >= 0 ? '+' : ''}${change})`,
    tag: 'points-update',
  });
}

// Player stats tracking for detecting changes
interface PlayerStats {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  bonus: number;
  minutes: number;
}

let previousStats: Record<number, PlayerStats> = {};

export function trackPlayerStats(
  playerId: number,
  playerName: string,
  teamName: string,
  currentStats: PlayerStats
): void {
  const prev = previousStats[playerId];
  
  if (prev) {
    // Check for goals
    if (currentStats.goals > prev.goals) {
      const newGoals = currentStats.goals - prev.goals;
      for (let i = 0; i < newGoals; i++) {
        notifyGoal(playerName, teamName, 4); // Approximate points
      }
    }
    
    // Check for assists
    if (currentStats.assists > prev.assists) {
      const newAssists = currentStats.assists - prev.assists;
      for (let i = 0; i < newAssists; i++) {
        notifyAssist(playerName, teamName, 3);
      }
    }
    
    // Check for yellow cards
    if (currentStats.yellowCards > prev.yellowCards) {
      notifyYellowCard(playerName, teamName);
    }
    
    // Check for red cards
    if (currentStats.redCards > prev.redCards) {
      notifyRedCard(playerName, teamName);
    }
    
    // Check for bonus points (usually finalized after match)
    if (currentStats.bonus > prev.bonus) {
      notifyBonusPoints(playerName, currentStats.bonus);
    }
  }
  
  // Update tracked stats
  previousStats[playerId] = { ...currentStats };
}

// Clear tracked stats (call when changing gameweek)
export function clearTrackedStats(): void {
  previousStats = {};
}

