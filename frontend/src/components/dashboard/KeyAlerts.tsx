'use client';

import Link from 'next/link';

interface Alert {
  id: string;
  type: 'injury' | 'price' | 'deadline' | 'news' | 'warning';
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionHref?: string;
  alertType?: 'fpl-squad' | 'favorite-team';
  playerIds?: number[];
}

interface KeyAlertsProps {
  alerts: Alert[];
  maxVisible?: number;
}

export default function KeyAlerts({ alerts, maxVisible = 3 }: KeyAlertsProps) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const visibleAlerts = alerts.slice(0, maxVisible);
  const remainingCount = alerts.length - maxVisible;

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'injury':
        return '🏥';
      case 'price':
        return '💰';
      case 'deadline':
        return '⏰';
      case 'news':
        return '📰';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getAlertColor = (type: Alert['type'], priority: Alert['priority']) => {
    if (priority === 'high') {
      switch (type) {
        case 'injury':
        case 'warning':
          return 'border-[var(--color-error)] bg-[var(--color-error)]/10';
        case 'deadline':
          return 'border-[var(--color-warning)] bg-[var(--color-warning)]/10';
        default:
          return 'border-[var(--pl-cyan)] bg-[var(--pl-cyan)]/10';
      }
    }
    return 'border-white/20 bg-white/5';
  };

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔔</span>
        <h3 className="text-lg sm:text-xl font-semibold text-white">Key Alerts</h3>
        {remainingCount > 0 && (
          <span className="ml-auto text-xs text-[var(--pl-text-muted)]">
            +{remainingCount} more
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        {visibleAlerts.map((alert) => {
          const getActionLabel = () => {
            if (alert.alertType === 'fpl-squad') {
              return 'View Squad';
            }
            if (alert.alertType === 'favorite-team') {
              return 'Team News';
            }
            return 'View Details';
          };

          const alertContent = (
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0" aria-hidden="true">
                {getAlertIcon(alert.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-white">{alert.message}</p>
                {alert.actionHref && (
                  <div className="mt-2">
                    <span className="text-xs text-[var(--pl-green)] hover:underline inline-flex items-center gap-1">
                      {getActionLabel()}
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
            </div>
          );

          if (alert.actionHref) {
            return (
              <Link
                key={alert.id}
                href={alert.actionHref}
                className={`block p-3 rounded-lg border ${getAlertColor(alert.type, alert.priority)} transition-colors hover:bg-white/10 touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--pl-cyan)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)]`}
                role="alert"
                aria-label={alert.message}
              >
                {alertContent}
              </Link>
            );
          }

          return (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${getAlertColor(alert.type, alert.priority)} transition-colors`}
              role="alert"
              aria-label={alert.message}
            >
              {alertContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}

