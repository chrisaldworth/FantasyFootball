'use client';

import { useMemo, useState } from 'react';

interface Player {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
  now_cost: number;
  total_points: number;
  event_points?: number;
  form: string;
  selected_by_percent: string;
  photo: string; // e.g., "123456.jpg"
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  saves: number;
  bonus: number;
  bps: number;
  ict_index: string;
  influence: string;
  creativity: string;
  threat: string;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  minutes: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  starts: number;
  chance_of_playing_next_round: number | null;
  news: string;
  news_added: string | null;
}

interface Pick {
  element: number;
  position: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
}

interface Team {
  id: number;
  name: string;
  short_name: string;
}

interface LivePlayerData {
  id: number;
  stats: {
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    bonus: number;
    total_points: number;
  };
}

interface TeamPitchProps {
  picks: Pick[];
  players: Player[];
  teams: Team[];
  bank: number;
  teamValue: number;
  liveData?: LivePlayerData[];
}

const TEAM_COLORS: { [key: string]: { bg: string; text: string } } = {
  ARS: { bg: '#EF0107', text: '#FFFFFF' },
  AVL: { bg: '#95BFE5', text: '#670E36' },
  BOU: { bg: '#DA291C', text: '#000000' },
  BRE: { bg: '#FFD700', text: '#000000' },
  BHA: { bg: '#0057B8', text: '#FFFFFF' },
  CHE: { bg: '#034694', text: '#FFFFFF' },
  CRY: { bg: '#1B458F', text: '#C4122E' },
  EVE: { bg: '#003399', text: '#FFFFFF' },
  FUL: { bg: '#000000', text: '#FFFFFF' },
  IPS: { bg: '#0044AA', text: '#FFFFFF' },
  LEI: { bg: '#003090', text: '#FDBE11' },
  LIV: { bg: '#C8102E', text: '#FFFFFF' },
  MCI: { bg: '#6CABDD', text: '#1C2C5B' },
  MUN: { bg: '#DA291C', text: '#FBE122' },
  NEW: { bg: '#241F20', text: '#FFFFFF' },
  NFO: { bg: '#DD0000', text: '#FFFFFF' },
  SOU: { bg: '#D71920', text: '#FFFFFF' },
  TOT: { bg: '#132257', text: '#FFFFFF' },
  WHU: { bg: '#7A263A', text: '#1BB1E7' },
  WOL: { bg: '#FDB913', text: '#231F20' },
};

function getPlayerPhotoUrl(photo: string): string {
  // photo is like "123456.jpg", we need to extract the number
  const photoCode = photo.replace('.jpg', '');
  return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${photoCode}.png`;
}

const POSITION_NAMES: { [key: number]: string } = {
  1: 'Goalkeeper',
  2: 'Defender',
  3: 'Midfielder',
  4: 'Forward',
};

function PlayerCard({
  player,
  team,
  pick,
  liveStats,
  onSelect,
  isBench = false,
}: {
  player: Player;
  team: Team;
  pick: Pick;
  liveStats?: LivePlayerData['stats'];
  onSelect: () => void;
  isBench?: boolean;
}) {
  const teamColor = TEAM_COLORS[team.short_name] || { bg: '#37003c', text: '#FFFFFF' };
  const rawPoints = liveStats?.total_points ?? player.event_points ?? 0;
  // For bench players, show raw points; for starters, show multiplied points
  const displayPoints = isBench ? rawPoints : rawPoints * pick.multiplier;
  const photoUrl = getPlayerPhotoUrl(player.photo);
  
  const hasPlayed = liveStats ? liveStats.minutes > 0 : false;
  const isYetToPlay = liveStats ? liveStats.minutes === 0 : true;

  return (
    <button 
      onClick={onSelect}
      className="flex flex-col items-center group cursor-pointer focus:outline-none touch-manipulation"
    >
      {/* Captain/Vice Badge */}
      {(pick.is_captain || pick.is_vice_captain) && (
        <div
          className={`absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] md:text-xs font-bold z-20 shadow-lg ${
            pick.is_captain
              ? 'bg-[var(--pl-green)] text-[var(--pl-dark)]'
              : 'bg-white/90 text-[var(--pl-dark)]'
          }`}
        >
          {pick.is_captain ? 'C' : 'V'}
        </div>
      )}

      {/* Player Photo */}
      <div className={`relative transition-transform group-hover:scale-105 sm:group-hover:scale-110 ${isYetToPlay && !isBench ? 'grayscale opacity-60' : ''}`}>
        {/* Played indicator ring */}
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden shadow-lg border-2 sm:border-3 transition-all group-hover:shadow-xl ${
            hasPlayed 
              ? 'border-[var(--pl-green)] ring-1 sm:ring-2 ring-[var(--pl-green)]/30' 
              : 'border-gray-500'
          }`}
          style={{ backgroundColor: teamColor.bg }}
        >
          <img
            src={photoUrl}
            alt={player.web_name}
            className="w-full h-full object-cover object-top scale-150 translate-y-0.5 sm:translate-y-1"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-bold" style="color: ${teamColor.text}">${team.short_name}</div>`;
            }}
          />
        </div>
        
        {/* Minutes Badge - only show if has data */}
        {liveStats && (
          <div 
            className={`absolute -top-0.5 -left-0.5 sm:-top-1 sm:-left-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[8px] sm:text-[10px] font-bold shadow-md flex items-center justify-center ${
              hasPlayed 
                ? 'bg-[var(--pl-green)] text-[var(--pl-dark)]' 
                : 'bg-gray-600 text-white'
            }`}
          >
            {liveStats.minutes}'
          </div>
        )}
        
        {/* Points Badge */}
        <div 
          className={`absolute -bottom-0.5 sm:-bottom-1 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shadow-md ${
            hasPlayed || isBench ? '' : 'bg-gray-600 text-white'
          }`}
          style={(hasPlayed || isBench) ? { backgroundColor: teamColor.bg, color: teamColor.text } : {}}
        >
          {displayPoints}
        </div>

        {/* Goal/Assist indicators */}
        {liveStats && (liveStats.goals_scored > 0 || liveStats.assists > 0) && (
          <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 flex gap-0.5">
            {liveStats.goals_scored > 0 && (
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white flex items-center justify-center text-[8px] sm:text-[10px]">
                ⚽
              </div>
            )}
            {liveStats.assists > 0 && (
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white flex items-center justify-center text-[8px] sm:text-[10px]">
                🅰️
              </div>
            )}
          </div>
        )}
      </div>

      {/* Player Name */}
      <div className="mt-1.5 sm:mt-2 md:mt-3 text-center">
        <div className={`text-[10px] sm:text-xs md:text-sm font-semibold truncate max-w-[50px] sm:max-w-[65px] md:max-w-[80px] drop-shadow-md group-hover:text-[var(--pl-green)] transition-colors ${isYetToPlay && !isBench ? 'text-white/50' : ''}`}>
          {player.web_name}
        </div>
        <div className="text-[9px] sm:text-[10px] md:text-xs text-white/70 font-medium">
          £{(player.now_cost / 10).toFixed(1)}m
        </div>
        {/* Bonus points indicator */}
        {liveStats && liveStats.bonus > 0 && (
          <div className="text-[8px] sm:text-[10px] text-[var(--pl-cyan)] font-bold">
            +{liveStats.bonus} BPS
          </div>
        )}
      </div>
    </button>
  );
}

function PlayerModal({
  player,
  team,
  pick,
  liveStats,
  onClose,
}: {
  player: Player;
  team: Team;
  pick: Pick;
  liveStats?: LivePlayerData['stats'];
  onClose: () => void;
}) {
  const teamColor = TEAM_COLORS[team.short_name] || { bg: '#37003c', text: '#FFFFFF' };
  const photoUrl = getPlayerPhotoUrl(player.photo);
  const rawPoints = liveStats?.total_points ?? player.event_points ?? 0;
  const isBench = pick.position > 11;
  const displayPoints = isBench ? rawPoints : rawPoints * pick.multiplier;

  const statGroups = [
    {
      title: 'Gameweek Stats',
      show: !!liveStats,
      cols: 3,
      stats: [
        { label: 'Minutes', value: liveStats?.minutes ?? 0 },
        { label: 'Goals', value: liveStats?.goals_scored ?? 0 },
        { label: 'Assists', value: liveStats?.assists ?? 0 },
        { label: 'Clean Sheets', value: liveStats?.clean_sheets ?? 0 },
        { label: 'Bonus', value: liveStats?.bonus ?? 0 },
        { label: 'Points', value: displayPoints, highlight: true },
      ],
    },
    {
      title: 'Season Stats',
      show: true,
      cols: 3,
      stats: [
        { label: 'Total Pts', value: player.total_points, highlight: true },
        { label: 'Goals', value: player.goals_scored },
        { label: 'Assists', value: player.assists },
        { label: 'Clean Sheets', value: player.clean_sheets },
        { label: 'Minutes', value: player.minutes },
        { label: 'Starts', value: player.starts },
      ],
    },
    {
      title: 'Expected Stats (Season)',
      show: true,
      cols: 3,
      stats: [
        { label: 'xG', value: parseFloat(player.expected_goals || '0').toFixed(2) },
        { label: 'xA', value: parseFloat(player.expected_assists || '0').toFixed(2) },
        { label: 'xGI', value: parseFloat(player.expected_goal_involvements || '0').toFixed(2) },
      ],
    },
    {
      title: 'ICT Index',
      show: true,
      cols: 4,
      stats: [
        { label: 'ICT', value: parseFloat(player.ict_index || '0').toFixed(1) },
        { label: 'Influence', value: parseFloat(player.influence || '0').toFixed(1) },
        { label: 'Creativity', value: parseFloat(player.creativity || '0').toFixed(1) },
        { label: 'Threat', value: parseFloat(player.threat || '0').toFixed(1) },
      ],
    },
    {
      title: 'Ownership & Form',
      show: true,
      cols: 3,
      stats: [
        { label: 'Form', value: player.form },
        { label: 'Selected', value: `${player.selected_by_percent}%` },
        { label: 'Price', value: `£${(player.now_cost / 10).toFixed(1)}m` },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto glass rounded-t-2xl sm:rounded-2xl animate-slide-up sm:m-4">
        {/* Header */}
        <div 
          className="sticky top-0 z-10 p-4 sm:p-6 rounded-t-2xl"
          style={{ background: `linear-gradient(135deg, ${teamColor.bg} 0%, ${teamColor.bg}dd 100%)` }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50 active:bg-black/60 transition-colors touch-manipulation"
          >
            <span className="text-white text-xl leading-none">×</span>
          </button>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 sm:border-3 border-white/30 shadow-xl flex-shrink-0">
              <img
                src={photoUrl}
                alt={player.web_name}
                className="w-full h-full object-cover object-top scale-150 translate-y-0.5 sm:translate-y-1"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div style={{ color: teamColor.text }} className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold truncate">{player.first_name} {player.second_name}</h2>
              <p className="opacity-80 text-sm sm:text-base truncate">{team.name} • {POSITION_NAMES[player.element_type]}</p>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                {pick.is_captain && (
                  <span className="px-1.5 sm:px-2 py-0.5 rounded bg-[var(--pl-green)] text-[var(--pl-dark)] text-[10px] sm:text-xs font-bold">
                    Captain
                  </span>
                )}
                {pick.is_vice_captain && (
                  <span className="px-1.5 sm:px-2 py-0.5 rounded bg-white/80 text-[var(--pl-dark)] text-[10px] sm:text-xs font-bold">
                    Vice Captain
                  </span>
                )}
                {isBench && (
                  <span className="px-1.5 sm:px-2 py-0.5 rounded bg-gray-600 text-white text-[10px] sm:text-xs font-bold">
                    Bench
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* News/Status */}
        {player.news && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg bg-[var(--pl-pink)]/20 border border-[var(--pl-pink)]/30">
            <div className="text-[10px] sm:text-xs text-[var(--pl-pink)] font-semibold mb-0.5 sm:mb-1">⚠️ News</div>
            <div className="text-xs sm:text-sm">{player.news}</div>
          </div>
        )}

        {/* Stats */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {statGroups.filter(g => g.show).map((group) => (
            <div key={group.title}>
              <h3 className="text-xs sm:text-sm font-semibold text-[var(--pl-text-muted)] mb-2 sm:mb-3">{group.title}</h3>
              <div className={`grid gap-2 sm:gap-3 ${group.cols === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                {group.stats.map((stat) => (
                  <div 
                    key={stat.label} 
                    className={`p-2 sm:p-3 rounded-lg ${'highlight' in stat && stat.highlight ? 'bg-[var(--pl-green)]/20' : 'bg-[var(--pl-dark)]/50'}`}
                  >
                    <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)] truncate">{stat.label}</div>
                    <div className={`text-sm sm:text-lg font-bold ${'highlight' in stat && stat.highlight ? 'text-[var(--pl-green)]' : ''}`}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Safe area padding for mobile */}
        <div className="h-6 sm:hidden" />
      </div>
    </div>
  );
}

export default function TeamPitch({
  picks,
  players,
  teams,
  bank,
  teamValue,
  liveData,
}: TeamPitchProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<{
    player: Player;
    team: Team;
    pick: Pick;
  } | null>(null);

  const { starters, bench, formation, liveStatsMap } = useMemo(() => {
    const starterPicks = picks.filter((p) => p.position <= 11);
    const benchPicks = picks.filter((p) => p.position > 11);

    const getPlayer = (pick: Pick) => players.find((p) => p.id === pick.element);
    const getTeam = (player: Player) => teams.find((t) => t.id === player.team);

    // Create a map of player ID to live stats
    const statsMap: { [key: number]: LivePlayerData['stats'] } = {};
    if (liveData) {
      liveData.forEach((ld) => {
        statsMap[ld.id] = ld.stats;
      });
    }

    // Group starters by position
    const grouped = {
      gk: [] as { pick: Pick; player: Player; team: Team }[],
      def: [] as { pick: Pick; player: Player; team: Team }[],
      mid: [] as { pick: Pick; player: Player; team: Team }[],
      fwd: [] as { pick: Pick; player: Player; team: Team }[],
    };

    starterPicks.forEach((pick) => {
      const player = getPlayer(pick);
      if (!player) return;
      const team = getTeam(player);
      if (!team) return;

      const data = { pick, player, team };
      switch (player.element_type) {
        case 1:
          grouped.gk.push(data);
          break;
        case 2:
          grouped.def.push(data);
          break;
        case 3:
          grouped.mid.push(data);
          break;
        case 4:
          grouped.fwd.push(data);
          break;
      }
    });

    const benchData = benchPicks.map((pick) => {
      const player = getPlayer(pick)!;
      const team = getTeam(player)!;
      return { pick, player, team };
    });

    const formation = `${grouped.def.length}-${grouped.mid.length}-${grouped.fwd.length}`;

    return {
      starters: grouped,
      bench: benchData,
      formation,
      liveStatsMap: statsMap,
    };
  }, [picks, players, teams, liveData]);

  // Calculate totals from live data
  const playedCount = liveData ? liveData.filter((p) => {
    const isPicked = picks.some((pick) => pick.element === p.id && pick.position <= 11);
    return isPicked && p.stats.minutes > 0;
  }).length : 0;

  const yetToPlayCount = 11 - playedCount;

  const totalValue = teamValue / 10;
  const bankValue = bank / 10;
  const squadValue = totalValue;

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="p-2 sm:p-3 md:p-4 rounded-xl bg-[var(--pl-dark)]/50">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 text-center">
          <div>
            <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)]">Formation</div>
            <div className="text-sm sm:text-lg font-bold text-[var(--pl-green)]">{formation}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)]">Value</div>
            <div className="text-sm sm:text-lg font-bold">£{squadValue.toFixed(1)}m</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)]">Bank</div>
            <div className="text-sm sm:text-lg font-bold text-[var(--pl-cyan)]">£{bankValue.toFixed(1)}m</div>
          </div>
          {liveData && (
            <>
              <div className="hidden sm:block">
                <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)]">Played</div>
                <div className="text-sm sm:text-lg font-bold text-[var(--pl-green)]">{playedCount}</div>
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)]">Yet to Play</div>
                <div className="text-sm sm:text-lg font-bold text-[var(--pl-pink)]">{yetToPlayCount}</div>
              </div>
            </>
          )}
        </div>
        {/* Mobile-only played/yet to play row */}
        {liveData && (
          <div className="grid grid-cols-2 gap-2 mt-2 sm:hidden text-center">
            <div className="bg-[var(--pl-green)]/10 rounded-lg py-1">
              <span className="text-[10px] text-[var(--pl-text-muted)]">Played: </span>
              <span className="text-sm font-bold text-[var(--pl-green)]">{playedCount}</span>
            </div>
            <div className="bg-[var(--pl-pink)]/10 rounded-lg py-1">
              <span className="text-[10px] text-[var(--pl-text-muted)]">Yet to Play: </span>
              <span className="text-sm font-bold text-[var(--pl-pink)]">{yetToPlayCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Pitch */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Pitch Background */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to bottom, 
                #2d5a27 0%, 
                #3d7a37 10%, 
                #2d5a27 20%, 
                #3d7a37 30%, 
                #2d5a27 40%, 
                #3d7a37 50%, 
                #2d5a27 60%, 
                #3d7a37 70%, 
                #2d5a27 80%, 
                #3d7a37 90%, 
                #2d5a27 100%
              )
            `,
          }}
        />

        {/* Pitch Lines */}
        <div className="absolute inset-0 opacity-30">
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white rounded-full" />
          {/* Halfway line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white" />
          {/* Penalty areas */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-16 border-2 border-white border-t-0" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-16 border-2 border-white border-b-0" />
        </div>

        {/* Players */}
        <div className="relative z-10 py-3 sm:py-4 md:py-6 px-1 sm:px-2 md:px-4 space-y-2 sm:space-y-3 md:space-y-5">
          {/* Forwards */}
          <div className="flex justify-center gap-1 sm:gap-3 md:gap-6 lg:gap-8">
            {starters.fwd.map(({ pick, player, team }) => (
              <div key={pick.element} className="relative">
                <PlayerCard
                  player={player}
                  team={team}
                  pick={pick}
                  liveStats={liveStatsMap[player.id]}
                  onSelect={() => setSelectedPlayer({ player, team, pick })}
                />
              </div>
            ))}
          </div>

          {/* Midfielders */}
          <div className="flex justify-center gap-0.5 sm:gap-2 md:gap-4 lg:gap-6">
            {starters.mid.map(({ pick, player, team }) => (
              <div key={pick.element} className="relative">
                <PlayerCard
                  player={player}
                  team={team}
                  pick={pick}
                  liveStats={liveStatsMap[player.id]}
                  onSelect={() => setSelectedPlayer({ player, team, pick })}
                />
              </div>
            ))}
          </div>

          {/* Defenders */}
          <div className="flex justify-center gap-0.5 sm:gap-2 md:gap-4 lg:gap-6">
            {starters.def.map(({ pick, player, team }) => (
              <div key={pick.element} className="relative">
                <PlayerCard
                  player={player}
                  team={team}
                  pick={pick}
                  liveStats={liveStatsMap[player.id]}
                  onSelect={() => setSelectedPlayer({ player, team, pick })}
                />
              </div>
            ))}
          </div>

          {/* Goalkeeper */}
          <div className="flex justify-center">
            {starters.gk.map(({ pick, player, team }) => (
              <div key={pick.element} className="relative">
                <PlayerCard
                  player={player}
                  team={team}
                  pick={pick}
                  liveStats={liveStatsMap[player.id]}
                  onSelect={() => setSelectedPlayer({ player, team, pick })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bench */}
      <div className="p-2 sm:p-3 md:p-4 rounded-xl bg-[var(--pl-dark)]/50">
        <h3 className="text-xs sm:text-sm font-semibold text-[var(--pl-text-muted)] mb-2 sm:mb-3 md:mb-4 text-center">SUBSTITUTES</h3>
        <div className="flex justify-center gap-1 sm:gap-3 md:gap-6 lg:gap-8">
          {bench.map(({ pick, player, team }) => (
            <div key={pick.element} className="relative opacity-80 hover:opacity-100 transition-opacity">
              <PlayerCard
                player={player}
                team={team}
                pick={pick}
                liveStats={liveStatsMap[player.id]}
                onSelect={() => setSelectedPlayer({ player, team, pick })}
                isBench={true}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Player Modal */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer.player}
          team={selectedPlayer.team}
          pick={selectedPlayer.pick}
          liveStats={liveStatsMap[selectedPlayer.player.id]}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}

