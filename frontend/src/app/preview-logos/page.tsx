'use client';

import TeamLogoEnhanced from '@/components/TeamLogoEnhanced';
import { 
  MatchIcon, 
  PlayerIcon, 
  TrophyIcon, 
  AnalyticsIcon, 
  NewsIcon, 
  FixturesIcon,
  SquadIcon,
  TransfersIcon,
  CaptainIcon,
  LeaguesIcon,
  OverviewIcon,
  StandingsIcon,
  SettingsIcon,
  HomeIcon,
  PicksIcon
} from '@/components/icons/AppIcons';

/**
 * Preview page to review generated logos and icons
 * Visit /preview-logos to see all designs
 */
export default function PreviewLogosPage() {
  const teams = [
    { id: 1, name: 'Arsenal' },
    { id: 12, name: 'Liverpool' },
    { id: 13, name: 'Manchester City' },
    { id: 14, name: 'Manchester Utd' },
    { id: 6, name: 'Chelsea' },
    { id: 18, name: 'Tottenham' },
  ];

  const styles = ['badge', 'shield', 'modern', 'classic'] as const;

  return (
    <div className="min-h-screen bg-[var(--pl-dark)] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Logo & Icon Preview</h1>
        
        {/* Team Logos - Different Styles */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Team Logos - Style Variations</h2>
          <div className="space-y-8">
            {styles.map(style => (
              <div key={style}>
                <h3 className="text-xl font-semibold mb-4 capitalize">{style} Style</h3>
                <div className="grid grid-cols-6 gap-4">
                  {teams.map(team => (
                    <div key={team.id} className="text-center">
                      <div className="mb-2">
                        <TeamLogoEnhanced teamId={team.id} size={80} style={style} />
                      </div>
                      <p className="text-sm text-gray-400">{team.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team Logos - Different Sizes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Team Logos - Size Variations</h2>
          <div className="space-y-6">
            {teams.slice(0, 2).map(team => (
              <div key={team.id}>
                <h3 className="text-lg font-semibold mb-4">{team.name}</h3>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <TeamLogoEnhanced teamId={team.id} size={32} style="badge" />
                    <p className="text-xs mt-1 text-gray-400">32px</p>
                  </div>
                  <div className="text-center">
                    <TeamLogoEnhanced teamId={team.id} size={48} style="badge" />
                    <p className="text-xs mt-1 text-gray-400">48px</p>
                  </div>
                  <div className="text-center">
                    <TeamLogoEnhanced teamId={team.id} size={64} style="badge" />
                    <p className="text-xs mt-1 text-gray-400">64px</p>
                  </div>
                  <div className="text-center">
                    <TeamLogoEnhanced teamId={team.id} size={96} style="badge" />
                    <p className="text-xs mt-1 text-gray-400">96px</p>
                  </div>
                  <div className="text-center">
                    <TeamLogoEnhanced teamId={team.id} size={128} style="badge" />
                    <p className="text-xs mt-1 text-gray-400">128px</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All Team Logos */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">All Premier League Teams (Badge Style)</h2>
          <div className="grid grid-cols-5 gap-6">
            {Array.from({ length: 20 }, (_, i) => i + 1).map(teamId => (
              <div key={teamId} className="text-center">
                <div className="mb-2">
                  <TeamLogoEnhanced teamId={teamId} size={64} style="badge" />
                </div>
                <p className="text-sm text-gray-400">Team {teamId}</p>
              </div>
            ))}
          </div>
        </section>

        {/* App Icons */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">App Icons</h2>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center p-4 glass rounded-lg">
              <MatchIcon size={32} color="var(--pl-green)" />
              <p className="text-sm mt-2">Match</p>
            </div>
            <div className="text-center p-4 glass rounded-lg">
              <PlayerIcon size={32} color="var(--pl-cyan)" />
              <p className="text-sm mt-2">Player</p>
            </div>
            <div className="text-center p-4 glass rounded-lg">
              <TrophyIcon size={32} color="var(--pl-pink)" />
              <p className="text-sm mt-2">Trophy</p>
            </div>
            <div className="text-center p-4 glass rounded-lg">
              <AnalyticsIcon size={32} color="var(--pl-purple)" />
              <p className="text-sm mt-2">Analytics</p>
            </div>
            <div className="text-center p-4 glass rounded-lg">
              <NewsIcon size={32} color="var(--pl-green)" />
              <p className="text-sm mt-2">News</p>
            </div>
            <div className="text-center p-4 glass rounded-lg">
              <FixturesIcon size={32} color="var(--pl-cyan)" />
              <p className="text-sm mt-2">Fixtures</p>
            </div>
            <div className="text-center p-4 glass rounded-lg">
              <SquadIcon size={32} color="var(--pl-pink)" />
              <p className="text-sm mt-2">Squad</p>
            </div>
            <div className="text-center p-4 glass rounded-lg">
              <TransfersIcon size={32} color="var(--pl-purple)" />
              <p className="text-sm mt-2">Transfers</p>
            </div>
            <div className="text-center p-4 glass rounded-lg">
              <CaptainIcon size={32} color="var(--pl-green)" />
              <p className="text-sm mt-2">Captain</p>
            </div>
            <div className="text-center p-4 glass rounded-lg">
              <LeaguesIcon size={32} color="var(--pl-cyan)" />
              <p className="text-sm mt-2">Leagues</p>
            </div>
            <div className="text-center p-4 glass rounded-lg">
              <OverviewIcon size={32} color="var(--pl-pink)" />
              <p className="text-sm mt-2">Overview</p>
            </div>
            <div className="text-center p-4 glass rounded-lg">
              <StandingsIcon size={32} color="var(--pl-purple)" />
              <p className="text-sm mt-2">Standings</p>
            </div>
            <div className="text-center p-4 glass rounded-lg">
              <SettingsIcon size={32} color="var(--pl-green)" />
              <p className="text-sm mt-2">Settings</p>
            </div>
            <div className="text-center p-4 glass rounded-lg">
              <HomeIcon size={32} color="var(--pl-cyan)" />
              <p className="text-sm mt-2">Home</p>
            </div>
            <div className="text-center p-4 glass rounded-lg">
              <PicksIcon size={32} color="var(--pl-pink)" />
              <p className="text-sm mt-2">Picks</p>
            </div>
          </div>
        </section>

        {/* Icon Sizes */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Icon Size Variations</h2>
          <div className="flex items-center gap-6">
            {[16, 24, 32, 48, 64].map(size => (
              <div key={size} className="text-center">
                <div className="mb-2 p-4 glass rounded-lg inline-block">
                  <MatchIcon size={size} color="var(--pl-green)" />
                </div>
                <p className="text-xs text-gray-400">{size}px</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

