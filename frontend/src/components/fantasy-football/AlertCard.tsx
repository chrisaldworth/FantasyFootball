'use client';

import Link from 'next/link';

interface AlertCardProps {
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const priorityColors = {
  high: 'border-[var(--pl-pink)] bg-[var(--pl-pink)]/10',
  medium: 'border-[var(--pl-yellow)] bg-[var(--pl-yellow)]/10',
  low: 'border-[var(--pl-cyan)] bg-[var(--pl-cyan)]/10',
};

export default function AlertCard({
  priority,
  icon,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
}: AlertCardProps) {
  const priorityColor = priorityColors[priority];

  return (
    <div className={`rounded-xl border-2 ${priorityColor} p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">{icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-[var(--pl-text-muted)] mb-3">{message}</p>
          {(actionLabel && actionHref) && (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--fpl-primary)] hover:underline"
            >
              <span>{actionLabel}</span>
              <span aria-hidden="true">→</span>
            </Link>
          )}
          {actionLabel && onAction && !actionHref && (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--fpl-primary)] hover:underline"
            >
              <span>{actionLabel}</span>
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



