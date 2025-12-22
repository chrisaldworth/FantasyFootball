'use client';

import QuickActionButton from './QuickActionButton';

export default function QuickActionsBar() {
  const actions = [
    { icon: '👥', label: 'Squad', href: '/dashboard' },
    { icon: '🔄', label: 'Transfer', href: '/fantasy-football/transfers' },
    { icon: '📅', label: 'Fixtures', href: '/fantasy-football/fixtures' },
    { icon: '📰', label: 'News', href: '/dashboard#news' },
    { icon: '📊', label: 'Analytics', href: '/fantasy-football/analytics' },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
      {actions.map((action) => (
        <QuickActionButton
          key={action.href}
          icon={action.icon}
          label={action.label}
          href={action.href}
        />
      ))}
    </div>
  );
}

