'use client';

interface Alert {
  id: string;
  type: 'injury' | 'price' | 'deadline' | 'news' | 'warning';
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionHref?: string;
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
          return 'border-[var(--team-primary)] bg-[var(--team-primary)]/10';
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
        {visibleAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border ${getAlertColor(alert.type, alert.priority)} transition-colors ${
              alert.actionHref ? 'cursor-pointer hover:bg-white/10' : ''
            }`}
            role={alert.actionHref ? 'button' : 'alert'}
            aria-label={alert.message}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0" aria-hidden="true">
                {getAlertIcon(alert.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-white">{alert.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

