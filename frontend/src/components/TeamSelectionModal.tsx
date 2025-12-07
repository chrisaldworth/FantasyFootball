'use client';

import { useState, useEffect } from 'react';
import { fplApi, fplAccountApi } from '@/lib/api';
import LinkFPLAccountModal from './LinkFPLAccountModal';

interface Player {
  id: number;
  web_name: string;
  team: number;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
  now_cost: number;
  photo: string;
  total_points: number;
  form: string;
  selected_by_percent: string;
  news: string;
  chance_of_playing_next_round: number | null;
}

interface Pick {
  element: number;
  position: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
}

interface TeamSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: number;
  currentGameweek: number;
}

type ChipType = 'wildcard' | 'freehit' | 'bboost' | '3xc' | null;

const POSITION_NAMES: Record<number, string> = {
  1: 'GKP',
  2: 'DEF',
  3: 'MID',
  4: 'FWD',
};

const POSITION_COLORS: Record<number, string> = {
  1: 'from-yellow-500 to-yellow-600',
  2: 'from-green-500 to-green-600',
  3: 'from-blue-500 to-blue-600',
  4: 'from-red-500 to-red-600',
};

const CHIP_INFO: Record<string, { name: string; description: string; icon: string }> = {
  wildcard: {
    name: 'Wildcard',
    description: 'Make unlimited free transfers this gameweek',
    icon: '🃏',
  },
  freehit: {
    name: 'Free Hit',
    description: 'Make unlimited transfers for one gameweek only',
    icon: '⚡',
  },
  bboost: {
    name: 'Bench Boost',
    description: 'Your bench players score points this gameweek',
    icon: '📈',
  },
  '3xc': {
    name: 'Triple Captain',
    description: 'Your captain scores 3x points this gameweek',
    icon: '👑',
  },
};

export default function TeamSelectionModal({
  isOpen,
  onClose,
  teamId,
  currentGameweek,
}: TeamSelectionModalProps) {
  const [loading, setLoading] = useState(true);
  const [allPlayers, setAllPlayers] = useState<Record<number, Player>>({});
  const [teams, setTeams] = useState<Record<number, { name: string; short_name: string }>>({});
  const [originalPicks, setOriginalPicks] = useState<Pick[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [activeChip, setActiveChip] = useState<ChipType>(null);
  const [usedChips, setUsedChips] = useState<string[]>([]);
  const [bank, setBank] = useState(0);
  const [transfers, setTransfers] = useState(0);
  const [changes, setChanges] = useState<string[]>([]);
  
  // FPL Account linking
  const [isLinked, setIsLinked] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      checkAccountStatus();
    }
  }, [isOpen, teamId, currentGameweek]);

  const checkAccountStatus = async () => {
    try {
      const status = await fplAccountApi.getStatus();
      setIsLinked(status.linked);
    } catch (err) {
      setIsLinked(false);
    }
  };

  useEffect(() => {
    // Track changes
    const newChanges: string[] = [];
    
    // Captain changes
    const originalCaptain = originalPicks.find(p => p.is_captain);
    const newCaptain = picks.find(p => p.is_captain);
    if (originalCaptain && newCaptain && originalCaptain.element !== newCaptain.element) {
      const oldName = allPlayers[originalCaptain.element]?.web_name || 'Unknown';
      const newName = allPlayers[newCaptain.element]?.web_name || 'Unknown';
      newChanges.push(`Captain: ${oldName} → ${newName}`);
    }

    // Vice captain changes
    const originalVice = originalPicks.find(p => p.is_vice_captain);
    const newVice = picks.find(p => p.is_vice_captain);
    if (originalVice && newVice && originalVice.element !== newVice.element) {
      const oldName = allPlayers[originalVice.element]?.web_name || 'Unknown';
      const newName = allPlayers[newVice.element]?.web_name || 'Unknown';
      newChanges.push(`Vice Captain: ${oldName} → ${newName}`);
    }

    // Position swaps
    originalPicks.forEach((origPick) => {
      const newPick = picks.find(p => p.element === origPick.element);
      if (newPick && origPick.position !== newPick.position) {
        const playerName = allPlayers[origPick.element]?.web_name || 'Unknown';
        const fromPos = origPick.position <= 11 ? 'Starting XI' : 'Bench';
        const toPos = newPick.position <= 11 ? 'Starting XI' : 'Bench';
        if (fromPos !== toPos) {
          newChanges.push(`${playerName}: ${fromPos} → ${toPos}`);
        }
      }
    });

    if (activeChip) {
      newChanges.push(`Chip: ${CHIP_INFO[activeChip].name}`);
    }

    setChanges(newChanges);
  }, [picks, originalPicks, activeChip, allPlayers]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bootstrap, picksData, historyData] = await Promise.all([
        fplApi.getBootstrap(),
        fplApi.getUserPicks(teamId, currentGameweek),
        fplApi.getUserHistory(teamId),
      ]);

      // Build player and team maps
      const playerMap: Record<number, Player> = {};
      bootstrap.elements.forEach((p: Player) => {
        playerMap[p.id] = p;
      });
      setAllPlayers(playerMap);

      const teamMap: Record<number, { name: string; short_name: string }> = {};
      bootstrap.teams.forEach((t: { id: number; name: string; short_name: string }) => {
        teamMap[t.id] = { name: t.name, short_name: t.short_name };
      });
      setTeams(teamMap);

      // Set picks
      const currentPicks = picksData.picks || [];
      setOriginalPicks(JSON.parse(JSON.stringify(currentPicks)));
      setPicks(currentPicks);

      // Set bank and transfers
      setBank(picksData.entry_history?.bank || 0);
      setTransfers(picksData.entry_history?.event_transfers || 0);

      // Get used chips
      const chips = historyData.chips?.map((c: { name: string }) => c.name) || [];
      setUsedChips(chips);
    } catch (error) {
      console.error('Failed to fetch team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerClick = (elementId: number) => {
    if (selectedPlayer === null) {
      setSelectedPlayer(elementId);
    } else if (selectedPlayer === elementId) {
      setSelectedPlayer(null);
    } else {
      // Swap players
      swapPlayers(selectedPlayer, elementId);
      setSelectedPlayer(null);
    }
  };

  const swapPlayers = (player1Id: number, player2Id: number) => {
    const pick1 = picks.find(p => p.element === player1Id);
    const pick2 = picks.find(p => p.element === player2Id);
    
    if (!pick1 || !pick2) return;

    const player1 = allPlayers[player1Id];
    const player2 = allPlayers[player2Id];

    // Check if positions are compatible for swapping
    // GK can only swap with GK
    if (player1.element_type === 1 || player2.element_type === 1) {
      if (player1.element_type !== player2.element_type) {
        return; // Can't swap GK with outfield
      }
    }

    // Swap positions
    setPicks(prev => prev.map(p => {
      if (p.element === player1Id) {
        return { ...p, position: pick2.position };
      }
      if (p.element === player2Id) {
        return { ...p, position: pick1.position };
      }
      return p;
    }));
  };

  const setCaptain = (elementId: number) => {
    const currentCaptain = picks.find(p => p.is_captain);
    const currentVice = picks.find(p => p.is_vice_captain);
    
    setPicks(prev => prev.map(p => {
      if (p.element === elementId) {
        return { ...p, is_captain: true, is_vice_captain: false, multiplier: activeChip === '3xc' ? 3 : 2 };
      }
      if (p.element === currentCaptain?.element && currentCaptain.element !== elementId) {
        return { ...p, is_captain: false, multiplier: 1 };
      }
      if (p.element === currentVice?.element && elementId === currentVice.element) {
        // If clicking on vice, they become captain, old captain becomes vice
        return p;
      }
      return p;
    }));

    // Make old captain the new vice
    if (currentCaptain && currentCaptain.element !== elementId) {
      setPicks(prev => prev.map(p => {
        if (p.element === currentCaptain.element) {
          return { ...p, is_vice_captain: true };
        }
        if (p.is_vice_captain && p.element !== currentCaptain.element) {
          return { ...p, is_vice_captain: false };
        }
        return p;
      }));
    }
  };

  const setViceCaptain = (elementId: number) => {
    const currentCaptain = picks.find(p => p.is_captain);
    
    if (currentCaptain?.element === elementId) return; // Can't be both
    
    setPicks(prev => prev.map(p => ({
      ...p,
      is_vice_captain: p.element === elementId,
    })));
  };

  const toggleChip = (chip: ChipType) => {
    if (activeChip === chip) {
      setActiveChip(null);
      // Reset triple captain multiplier if deselecting
      if (chip === '3xc') {
        setPicks(prev => prev.map(p => ({
          ...p,
          multiplier: p.is_captain ? 2 : 1,
        })));
      }
    } else {
      setActiveChip(chip);
      // Apply triple captain multiplier
      if (chip === '3xc') {
        setPicks(prev => prev.map(p => ({
          ...p,
          multiplier: p.is_captain ? 3 : 1,
        })));
      }
    }
  };

  const resetChanges = () => {
    setPicks(JSON.parse(JSON.stringify(originalPicks)));
    setActiveChip(null);
    setSelectedPlayer(null);
  };

  const getPlayerPhotoUrl = (photo: string): string => {
    if (!photo) return '';
    const photoCode = photo.replace('.jpg', '');
    return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${photoCode}.png`;
  };

  const startingXI = picks
    .filter(p => p.position <= 11)
    .sort((a, b) => a.position - b.position);
  
  const bench = picks
    .filter(p => p.position > 11)
    .sort((a, b) => a.position - b.position);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#1a1a2e] rounded-2xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold">Team Selection</h2>
            <p className="text-sm text-gray-400">GW{currentGameweek} • Plan your team changes</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="w-12 h-12 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            {/* Info Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400">Bank</div>
                <div className="text-lg font-bold text-[var(--pl-green)]">£{(bank / 10).toFixed(1)}m</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400">Free Transfers</div>
                <div className="text-lg font-bold">1</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400">Team Value</div>
                <div className="text-lg font-bold">
                  £{(picks.reduce((sum, p) => sum + (allPlayers[p.element]?.now_cost || 0), 0) / 10).toFixed(1)}m
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400">Changes</div>
                <div className="text-lg font-bold text-[var(--pl-cyan)]">{changes.length}</div>
              </div>
            </div>

            {/* Chips */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Chips</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CHIP_INFO).map(([key, chip]) => {
                  const isUsed = usedChips.includes(key);
                  const isActive = activeChip === key;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => !isUsed && toggleChip(key as ChipType)}
                      disabled={isUsed}
                      className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                        isUsed
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : isActive
                          ? 'bg-gradient-to-r from-[var(--pl-purple)] to-[var(--pl-pink)] text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                      title={chip.description}
                    >
                      <span>{chip.icon}</span>
                      <span className="text-sm font-medium">{chip.name}</span>
                      {isUsed && <span className="text-xs">(Used)</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-4">
              <p className="text-sm text-blue-300">
                <strong>Tap a player</strong> to select, then <strong>tap another</strong> to swap positions.
                <strong> Long press</strong> or <strong>double-tap</strong> to change captain (C) or vice-captain (V).
              </p>
            </div>

            {/* Starting XI */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Starting XI</h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-11 gap-2">
                {startingXI.map((pick) => {
                  const player = allPlayers[pick.element];
                  if (!player) return null;
                  
                  const isSelected = selectedPlayer === pick.element;
                  const team = teams[player.team];
                  
                  return (
                    <div
                      key={pick.element}
                      onClick={() => handlePlayerClick(pick.element)}
                      onDoubleClick={() => setCaptain(pick.element)}
                      className={`relative p-2 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[var(--pl-green)]/30 ring-2 ring-[var(--pl-green)]'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {/* Captain/Vice Badge */}
                      {pick.is_captain && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center justify-center z-10">
                          C
                        </div>
                      )}
                      {pick.is_vice_captain && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gray-400 text-black text-xs font-bold flex items-center justify-center z-10">
                          V
                        </div>
                      )}
                      
                      {/* Player Photo */}
                      <div className="relative w-full aspect-square mb-1">
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${POSITION_COLORS[player.element_type]} opacity-30`} />
                        <img
                          src={getPlayerPhotoUrl(player.photo)}
                          alt={player.web_name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '';
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {/* Position Badge */}
                        <div className={`absolute bottom-0 right-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r ${POSITION_COLORS[player.element_type]} text-white`}>
                          {POSITION_NAMES[player.element_type]}
                        </div>
                      </div>
                      
                      {/* Player Info */}
                      <div className="text-center">
                        <div className="text-xs font-semibold truncate">{player.web_name}</div>
                        <div className="text-[10px] text-gray-400">{team?.short_name}</div>
                        <div className="text-[10px] text-[var(--pl-green)]">£{(player.now_cost / 10).toFixed(1)}m</div>
                      </div>

                      {/* Injury/News indicator */}
                      {player.news && (
                        <div className="absolute top-0 left-0 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px]" title={player.news}>
                          !
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bench */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Bench</h3>
              <div className="grid grid-cols-4 gap-2">
                {bench.map((pick) => {
                  const player = allPlayers[pick.element];
                  if (!player) return null;
                  
                  const isSelected = selectedPlayer === pick.element;
                  const team = teams[player.team];
                  
                  return (
                    <div
                      key={pick.element}
                      onClick={() => handlePlayerClick(pick.element)}
                      className={`relative p-2 rounded-xl cursor-pointer transition-all opacity-70 hover:opacity-100 ${
                        isSelected
                          ? 'bg-[var(--pl-green)]/30 ring-2 ring-[var(--pl-green)] opacity-100'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {/* Bench position number */}
                      <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-gray-600 text-white text-[10px] font-bold flex items-center justify-center z-10">
                        {pick.position - 11}
                      </div>

                      {/* Player Photo */}
                      <div className="relative w-full aspect-square mb-1">
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${POSITION_COLORS[player.element_type]} opacity-20`} />
                        <img
                          src={getPlayerPhotoUrl(player.photo)}
                          alt={player.web_name}
                          className="w-full h-full object-cover rounded-lg grayscale"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '';
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className={`absolute bottom-0 right-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r ${POSITION_COLORS[player.element_type]} text-white`}>
                          {POSITION_NAMES[player.element_type]}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs font-semibold truncate">{player.web_name}</div>
                        <div className="text-[10px] text-gray-400">{team?.short_name}</div>
                        <div className="text-[10px] text-[var(--pl-green)]">£{(player.now_cost / 10).toFixed(1)}m</div>
                      </div>

                      {player.news && (
                        <div className="absolute top-0 left-0 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px]" title={player.news}>
                          !
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Changes Summary */}
            {changes.length > 0 && (
              <div className="bg-[var(--pl-purple)]/20 border border-[var(--pl-purple)]/40 rounded-xl p-4 mb-4">
                <h3 className="text-sm font-semibold text-[var(--pl-purple)] mb-2">
                  Planned Changes ({changes.length})
                </h3>
                <ul className="space-y-1">
                  {changes.map((change, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                      <span className="text-[var(--pl-green)]">→</span>
                      {change}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-gray-400">
                  Make these changes on the official FPL website or app.
                </p>
              </div>
            )}

            {/* Save Message */}
            {saveMessage && (
              <div className={`p-4 rounded-xl mb-4 ${
                saveMessage.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                  : 'bg-red-500/20 border border-red-500/40 text-red-300'
              }`}>
                {saveMessage.text}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={resetChanges}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-semibold transition-colors"
              >
                Reset
              </button>
              
              {isLinked ? (
                <button
                  onClick={handleSaveTeam}
                  disabled={saving || changes.length === 0}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[var(--pl-green)] to-[var(--pl-cyan)] text-[var(--pl-dark)] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Apply Changes'
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[var(--pl-purple)] to-[var(--pl-pink)] text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Link FPL Account
                </button>
              )}
            </div>
            
            {!isLinked && (
              <p className="text-xs text-gray-500 text-center mt-3">
                Link your FPL account to apply changes directly, or{' '}
                <a 
                  href="https://fantasy.premierleague.com/my-team" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--pl-cyan)] hover:underline"
                >
                  make changes on FPL website
                </a>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Link FPL Account Modal */}
      <LinkFPLAccountModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onLinked={() => {
          setIsLinked(true);
          setShowLinkModal(false);
        }}
      />
    </div>
  );

  async function handleSaveTeam() {
    if (changes.length === 0) return;
    
    setSaving(true);
    setSaveMessage(null);
    
    try {
      // Format picks for the API
      const formattedPicks = picks.map(pick => ({
        element: pick.element,
        position: pick.position,
        is_captain: pick.is_captain,
        is_vice_captain: pick.is_vice_captain,
      }));
      
      await fplAccountApi.saveTeam(formattedPicks, activeChip || undefined);
      
      setSaveMessage({ type: 'success', text: '✓ Changes saved successfully!' });
      setOriginalPicks(JSON.parse(JSON.stringify(picks)));
      setActiveChip(null);
      
      // Refresh data after a moment
      setTimeout(() => {
        fetchData();
      }, 1000);
      
    } catch (err: any) {
      setSaveMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to save changes. Please try again.' 
      });
    } finally {
      setSaving(false);
    }
  }
}

