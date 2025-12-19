'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'fpl' | 'team';
  items: Array<{
    icon: string;
    label: string;
    href: string;
  }>;
  teamLogo?: string;
  teamName?: string;
}

export default function Drawer({ isOpen, onClose, type, items, teamLogo, teamName }: DrawerProps) {
  const pathname = usePathname();
  const isFPL = type === 'fpl';
  const title = isFPL ? 'FANTASY FOOTBALL' : 'MY TEAM';
  const icon = isFPL ? '⚽' : '🏆';

  return (
    <div
      className={`fixed inset-0 z-50 bg-[var(--pl-dark)]/90 backdrop-blur-sm transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} navigation menu`}
    >
      <div
        className={`absolute bottom-0 left-0 right-0 bg-[var(--pl-dark)] rounded-t-2xl border-t border-white/10 transition-transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {teamLogo && !isFPL ? (
              <img src={teamLogo} alt={teamName || 'Team'} className="w-6 h-6 object-contain" />
            ) : (
              <span className="text-2xl" aria-hidden="true">{icon}</span>
            )}
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-2xl hover:opacity-70 transition-opacity"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-all ${
                  isActive
                    ? isFPL
                      ? 'bg-[var(--fpl-primary)]/30 text-[var(--fpl-primary)]'
                      : 'bg-[var(--pl-green)]/30 text-[var(--pl-green)]'
                    : 'bg-[var(--pl-dark)]/50 hover:bg-[var(--pl-card-hover)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="text-xl" aria-hidden="true">{item.icon}</span>
                <span className="text-base font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

