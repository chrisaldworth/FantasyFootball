'use client';

import LiveRank from '@/components/LiveRank';
import CountdownTimer from './CountdownTimer';
import KeyAlerts from './KeyAlerts';

interface Alert {
  id: string;
  type: 'injury' | 'price' | 'deadline' | 'news' | 'warning';
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionHref?: string;
}

interface HeroSectionProps {
  teamId: number;
  currentGameweek: number | null;
  isLive: boolean;
  nextFixtureDate?: Date | string;
  nextFixtureLabel?: string;
  alerts?: Alert[];
}

export default function HeroSection({
  teamId,
  currentGameweek,
  isLive,
  nextFixtureDate,
  nextFixtureLabel,
  alerts = [],
}: HeroSectionProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-white px-1">
        What's Important Right Now
      </h2>
      
      {/* Mobile: Stacked vertically */}
      <div className="lg:hidden space-y-4">
        {isLive && currentGameweek && (
          <LiveRank teamId={teamId} currentGameweek={currentGameweek} isLive={isLive} />
        )}
        
        {nextFixtureDate && (
          <CountdownTimer targetDate={nextFixtureDate} label={nextFixtureLabel} />
        )}
        
        {alerts.length > 0 && <KeyAlerts alerts={alerts} />}
      </div>

      {/* Desktop: 2-column grid */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
        <div className="space-y-6">
          {isLive && currentGameweek && (
            <LiveRank teamId={teamId} currentGameweek={currentGameweek} isLive={isLive} />
          )}
          
          {nextFixtureDate && (
            <CountdownTimer targetDate={nextFixtureDate} label={nextFixtureLabel} />
          )}
        </div>
        
        <div>
          {alerts.length > 0 && <KeyAlerts alerts={alerts} />}
        </div>
      </div>
    </div>
  );
}

