'use client';

interface TeamPageHeaderProps {
  title: string;
  subtitle?: string;
  teamLogo?: string;
  teamName?: string;
}

export default function TeamPageHeader({ title, subtitle, teamLogo, teamName }: TeamPageHeaderProps) {
  return (
    <div
      className="px-4 sm:px-6 py-6 border-b-[3px]"
      style={{
        backgroundColor: 'var(--team-primary)',
        opacity: 0.1,
        borderColor: 'var(--team-primary)'
      }}
    >
      <div className="flex items-center gap-4">
        {teamLogo ? (
          <img 
            src={teamLogo} 
            alt={teamName || 'Team'} 
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain" 
          />
        ) : (
          <span className="text-5xl sm:text-6xl" aria-hidden="true">🏆</span>
        )}
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: 'var(--team-primary)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[var(--pl-text-muted)] mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

