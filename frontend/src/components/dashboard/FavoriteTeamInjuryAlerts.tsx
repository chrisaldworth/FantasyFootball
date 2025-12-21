'use client';

function getPlayerPhotoUrl(photo: string): string {
  const photoCode = photo.replace('.jpg', '');
  return `https://resources.premierleague.com/premierleague/photos/players/250x250/p${photoCode}.png`;
}

interface InjuredPlayer {
  id: number;
  name: string;
  position: string;
  photo: string | null;
  injuryStatus: string;
  chanceOfPlaying: number | null;
}

interface FavoriteTeamInjuryAlertsProps {
  teamName: string;
  injuredPlayers: InjuredPlayer[];
}

export default function FavoriteTeamInjuryAlerts({
  teamName,
  injuredPlayers,
}: FavoriteTeamInjuryAlertsProps) {
  if (injuredPlayers.length === 0) {
    return null;
  }

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl" aria-hidden="true">⚠️</span>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            My Team Injury Concerns
          </h3>
          <p className="text-sm text-[var(--pl-text-muted)]">{teamName}</p>
        </div>
      </div>

      <div className="space-y-3">
        {injuredPlayers.map((player) => (
          <div
            key={player.id}
            className="p-3 rounded-lg border-2 border-[var(--pl-pink)] bg-[var(--pl-pink)]/10 hover:bg-[var(--pl-pink)]/20 transition-colors"
          >
            <div className="flex items-start gap-3">
              {player.photo ? (
                <img
                  src={getPlayerPhotoUrl(player.photo)}
                  alt={player.name}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[var(--pl-dark)] flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl" aria-hidden="true">👤</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white">{player.name}</div>
                <div className="text-sm text-[var(--pl-text-muted)]">
                  {player.position}
                  {player.chanceOfPlaying !== null && (
                    <span> - {player.chanceOfPlaying}% chance</span>
                  )}
                </div>
                <div className="text-xs text-[var(--pl-text-muted)] mt-1">
                  {player.injuryStatus}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

