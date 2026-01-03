'use client';

import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredAlert, setHoveredAlert] = useState<string | null>(null);

  // Intersection observer for entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
    <div
      ref={containerRef}
      className={`
        glass rounded-xl p-4 sm:p-6
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        hover:shadow-[0_0_25px_rgba(4,245,255,0.15)]
      `}
    >
      {/* Header with animated bell icon */}
      <div
        className={`
          flex items-center gap-2 mb-3
          transition-all duration-500
          ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
        `}
      >
        <span
          className={`
            text-lg transition-transform duration-300
            ${alerts.some(a => a.priority === 'high') ? 'animate-wiggle' : ''}
          `}
        >
          🔔
        </span>
        <h3 className="text-lg sm:text-xl font-semibold text-white">Key Alerts</h3>
        {remainingCount > 0 && (
          <span
            className={`
              ml-auto text-xs px-2 py-0.5 rounded-full 
              bg-[var(--pl-cyan)]/20 text-[var(--pl-cyan)]
              transition-all duration-300
              ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
            `}
          >
            +{remainingCount} more
          </span>
        )}
      </div>
      
      {/* Alerts list with staggered entrance */}
      <div className="space-y-2">
        {visibleAlerts.map((alert, index) => {
          const getActionLabel = () => {
            if (alert.alertType === 'fpl-squad') {
              return 'View Squad';
            }
            if (alert.alertType === 'favorite-team') {
              return 'Team News';
            }
            return 'View Details';
          };

          const isHovered = hoveredAlert === alert.id;

          const alertContent = (
            <div className="flex items-start gap-3">
              {/* Icon with animation */}
              <span
                className={`
                  text-xl flex-shrink-0 transition-transform duration-300
                  ${isHovered ? 'scale-125 rotate-6' : 'scale-100 rotate-0'}
                  ${alert.priority === 'high' ? 'animate-bounce-subtle' : ''}
                `}
                aria-hidden="true"
              >
                {getAlertIcon(alert.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-white">{alert.message}</p>
                {alert.actionHref && (
                  <div className="mt-2">
                    <span
                      className={`
                        text-xs text-[var(--pl-green)] hover:underline 
                        inline-flex items-center gap-1 transition-all duration-300
                        ${isHovered ? 'gap-2' : 'gap-1'}
                      `}
                    >
                      {getActionLabel()}
                      <svg
                        className={`
                          w-3 h-3 transition-transform duration-300
                          ${isHovered ? 'translate-x-1' : 'translate-x-0'}
                        `}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
            </div>
          );

          const alertClasses = `
            p-3 rounded-lg border transition-all duration-300
            ${getAlertColor(alert.type, alert.priority)}
            ${isHovered ? 'scale-[1.02] shadow-lg' : 'scale-100'}
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
          `;

          if (alert.actionHref) {
            return (
              <Link
                key={alert.id}
                href={alert.actionHref}
                className={`block ${alertClasses} hover:bg-white/10 touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--pl-cyan)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)]`}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                role="alert"
                aria-label={alert.message}
                onMouseEnter={() => setHoveredAlert(alert.id)}
                onMouseLeave={() => setHoveredAlert(null)}
              >
                {alertContent}
              </Link>
            );
          }

          return (
            <div
              key={alert.id}
              className={alertClasses}
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              role="alert"
              aria-label={alert.message}
              onMouseEnter={() => setHoveredAlert(alert.id)}
              onMouseLeave={() => setHoveredAlert(null)}
            >
              {alertContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}

