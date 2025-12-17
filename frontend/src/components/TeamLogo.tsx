'use client';

import { useTeamTheme } from '@/lib/team-theme-context';

interface TeamLogoProps {
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
}

export default function TeamLogo({ size = 40, className = '', fallback }: TeamLogoProps) {
  const { theme } = useTeamTheme();

  if (!theme || !theme.logo) {
    if (fallback) {
      return <>{fallback}</>;
    }
    // Default logo
    return (
      <div 
        className={`rounded-lg bg-gradient-to-br from-[var(--pl-green)] to-[var(--pl-cyan)] flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-[var(--pl-dark)] font-bold" style={{ fontSize: size * 0.5 }}>
          F
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`rounded-lg overflow-hidden flex items-center justify-center ${className}`}
      style={{ 
        width: size, 
        height: size,
        backgroundColor: theme.primary + '20',
        border: `1px solid ${theme.primary}40`
      }}
    >
      <img
        src={theme.logo}
        alt={theme.name}
        style={{ width: size * 0.8, height: size * 0.8, objectFit: 'contain' }}
        onError={(e) => {
          // Fallback to default logo on error
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.parentElement) {
            target.parentElement.innerHTML = `
              <div style="width: ${size}px; height: ${size}px; background: ${theme.primary}; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <span style="color: ${theme.text}; font-weight: bold; font-size: ${size * 0.5}px;">${theme.code}</span>
              </div>
            `;
          }
        }}
      />
    </div>
  );
}

