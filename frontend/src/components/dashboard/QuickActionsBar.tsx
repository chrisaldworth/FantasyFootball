'use client';

import { useState } from 'react';
import Link from 'next/link';

interface QuickAction {
  icon: string;
  label: string;
  action?: () => void;
  href?: string;
  badge?: number | boolean;
}

interface QuickActionsBarProps {
  actions: QuickAction[];
  onTransferClick?: () => void;
  onCaptainClick?: () => void;
}

export default function QuickActionsBar({ actions, onTransferClick, onCaptainClick }: QuickActionsBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAction = (action: QuickAction) => {
    if (action.action) {
      action.action();
    }
    setIsExpanded(false);
  };

  // Mobile: Floating Action Button (FAB)
  const MobileFAB = () => {
    const mainAction = actions[0]; // First action is the main one

    return (
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        {/* Expanded Menu */}
        {isExpanded && (
          <div className="absolute bottom-16 right-0 mb-2 space-y-2">
            {actions.slice(1).map((action, index) => (
              <button
                key={index}
                onClick={() => handleAction(action)}
                className="flex items-center gap-3 glass rounded-full px-4 py-3 shadow-lg hover:bg-white/10 transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)]"
                aria-label={action.label}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-white font-medium whitespace-nowrap">{action.label}</span>
                {action.badge && (
                  <span className="w-2 h-2 rounded-full bg-[var(--color-error)]" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => {
            if (mainAction.action) {
              handleAction(mainAction);
            } else {
              setIsExpanded(!isExpanded);
            }
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[var(--team-primary)] to-[var(--team-secondary)] flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)]"
          aria-label={mainAction.label}
          aria-expanded={isExpanded}
        >
          <span className="text-2xl">{mainAction.icon}</span>
          {mainAction.badge && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-error)] border-2 border-[var(--pl-dark)]" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  };

  // Desktop: Horizontal Bar
  const DesktopBar = () => (
    <div className="hidden lg:flex lg:items-center lg:gap-4">
      {actions.map((action, index) => {
        const content = (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/10 transition-colors cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)]">
            <span className="text-xl">{action.icon}</span>
            <span className="text-sm font-medium text-white">{action.label}</span>
            {action.badge && (
              <span className="w-2 h-2 rounded-full bg-[var(--color-error)]" aria-hidden="true" />
            )}
          </div>
        );

        if (action.href) {
          return (
            <Link key={index} href={action.href} aria-label={action.label}>
              {content}
            </Link>
          );
        }

        return (
          <button
            key={index}
            onClick={() => handleAction(action)}
            aria-label={action.label}
          >
            {content}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <MobileFAB />
      <DesktopBar />
    </>
  );
}

