'use client';

import { useState } from 'react';
import TeamLogo from '@/components/TeamLogo';

// FPL Team IDs and names (2024/25 season)
const FPL_TEAMS = [
  { id: 1, name: 'Arsenal', code: 'ARS' },
  { id: 2, name: 'Aston Villa', code: 'AVL' },
  { id: 3, name: 'Bournemouth', code: 'BOU' },
  { id: 4, name: 'Brentford', code: 'BRE' },
  { id: 5, name: 'Brighton', code: 'BHA' },
  { id: 6, name: 'Chelsea', code: 'CHE' },
  { id: 7, name: 'Crystal Palace', code: 'CRY' },
  { id: 8, name: 'Everton', code: 'EVE' },
  { id: 9, name: 'Fulham', code: 'FUL' },
  { id: 10, name: 'Ipswich', code: 'IPS' },
  { id: 11, name: 'Leicester', code: 'LEI' },
  { id: 12, name: 'Liverpool', code: 'LIV' },
  { id: 13, name: 'Manchester City', code: 'MCI' },
  { id: 14, name: 'Manchester Utd', code: 'MUN' },
  { id: 15, name: 'Newcastle', code: 'NEW' },
  { id: 16, name: 'Nottingham Forest', code: 'NFO' },
  { id: 17, name: 'Southampton', code: 'SOU' },
  { id: 18, name: 'Tottenham', code: 'TOT' },
  { id: 19, name: 'West Ham', code: 'WHU' },
  { id: 20, name: 'Wolves', code: 'WOL' },
];

export default function LogosDebugPage() {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[var(--pl-dark)] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">FPL Team Logos - Manual Mapping</h1>
        <p className="text-[var(--pl-text-muted)] mb-8">
          Official FPL badge URL pattern: <code className="bg-[var(--pl-card)] px-2 py-1 rounded">https://resources.premierleague.com/premierleague/badges/t{'{teamId}'}.png</code>
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {FPL_TEAMS.map((team) => {
            const badgeUrl = `https://resources.premierleague.com/premierleague/badges/t${team.id}.png`;
            const isSelected = selectedTeam === team.id;

            return (
              <div
                key={team.id}
                className={`glass rounded-xl p-4 border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[var(--pl-green)] bg-[var(--pl-green)]/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
                onClick={() => setSelectedTeam(team.id)}
              >
                <div className="flex flex-col items-center gap-3">
                  {/* Official Badge */}
                  <div className="relative">
                    <img
                      src={badgeUrl}
                      alt={`${team.name} badge`}
                      className="w-20 h-20 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const errorDiv = target.nextElementSibling as HTMLElement;
                        if (errorDiv) errorDiv.style.display = 'flex';
                      }}
                    />
                    <div
                      className="hidden w-20 h-20 items-center justify-center bg-[var(--pl-card)] rounded text-[var(--pl-text-muted)] text-xs"
                      style={{ display: 'none' }}
                    >
                      Failed
                    </div>
                  </div>

                  {/* Generated Logo Fallback */}
                  <div className="border-t border-white/10 pt-3 w-full">
                    <p className="text-xs text-[var(--pl-text-muted)] text-center mb-2">Fallback:</p>
                    <div className="flex justify-center">
                      <TeamLogo teamId={team.id} size={40} />
                    </div>
                  </div>

                  {/* Team Info */}
                  <div className="text-center w-full">
                    <div className="text-lg font-bold text-white mb-1">
                      ID: {team.id}
                    </div>
                    <div className="text-sm text-[var(--pl-text-muted)] mb-1">
                      {team.name}
                    </div>
                    <div className="text-xs text-[var(--pl-text-muted)] font-mono">
                      {team.code}
                    </div>
                  </div>

                  {/* Badge URL */}
                  <div className="text-xs text-[var(--pl-text-muted)] break-all text-center font-mono bg-[var(--pl-card)] px-2 py-1 rounded w-full">
                    t{team.id}.png
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedTeam && (
          <div className="mt-8 glass rounded-xl p-6 border-2 border-[var(--pl-green)]">
            <h2 className="text-xl font-bold text-white mb-4">
              Selected: {FPL_TEAMS.find(t => t.id === selectedTeam)?.name} (ID: {selectedTeam})
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-[var(--pl-text-muted)]">Official Badge URL:</span>
                <code className="block bg-[var(--pl-card)] px-2 py-1 rounded mt-1 text-xs break-all">
                  https://resources.premierleague.com/premierleague/badges/t{selectedTeam}.png
                </code>
              </div>
              <div>
                <span className="text-[var(--pl-text-muted)]">Team Code:</span>
                <span className="ml-2 text-white font-mono">
                  {FPL_TEAMS.find(t => t.id === selectedTeam)?.code}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 glass rounded-xl p-6 border-2 border-[var(--pl-pink)]">
          <h2 className="text-xl font-bold text-white mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-[var(--pl-text-muted)]">
            <li>Click on each team card to see its details</li>
            <li>Verify that the official badge matches the team name</li>
            <li>If a badge is incorrect, note the team ID and the actual team it shows</li>
            <li>Check the fallback generated logo to see if it matches</li>
            <li>Report any mismatches so we can fix the team ID mapping</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

