'use client';

import { useState } from 'react';
import AlertCard from './AlertCard';

export interface AlertCardProps {
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

interface ActionItemsSectionProps {
  alerts: AlertCardProps[];
  defaultExpanded?: boolean;
}

export default function ActionItemsSection({ 
  alerts, 
  defaultExpanded = true 
}: ActionItemsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const sortedAlerts = alerts.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="glass rounded-2xl p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4"
        aria-expanded={isExpanded}
        aria-controls="action-items-content"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">⚠️</span>
          <h2 className="text-xl font-bold">Action Items & Alerts</h2>
          {alerts.length > 0 && (
            <span className="px-2 py-1 rounded-full bg-[var(--pl-pink)] text-white text-xs">
              {alerts.length}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div id="action-items-content" className="space-y-3">
          {sortedAlerts.length === 0 ? (
            <div className="text-center py-8 text-[var(--pl-text-muted)]">
              <p>No action items at this time.</p>
            </div>
          ) : (
            sortedAlerts.map((alert, index) => (
              <AlertCard key={index} {...alert} />
            ))
          )}
        </div>
      )}
    </div>
  );
}



