/**
 * Tests for Personalized Alerts Calculation Logic
 * 
 * Tests the alert calculation functions to ensure:
 * - Only user-relevant players are counted
 * - Injury detection works correctly
 * - Player name formatting is correct
 * - Edge cases are handled
 */

import { describe, it, expect } from '@jest/globals';

// Mock player data structure
interface Player {
  id: number;
  web_name: string;
  first_name?: string;
  second_name?: string;
  team: number;
  news?: string;
  chance_of_playing_next_round: number | null;
}

// Mock bootstrap data structure
interface Bootstrap {
  elements: Player[];
  teams: Array<{ id: number; short_name: string }>;
}

// Helper function to check if player is injured (matches dashboard logic)
function isInjured(p: Player): boolean {
  return (
    (p.news && p.news.length > 0 && p.news.toLowerCase().includes('injur')) ||
    (p.chance_of_playing_next_round !== null && p.chance_of_playing_next_round < 75)
  );
}

// Function to calculate FPL squad injury alerts (matches dashboard logic)
function calculateFPLSquadInjuries(
  bootstrap: Bootstrap,
  userSquadPlayerIds: number[]
): {
  count: number;
  players: Player[];
  message: string;
} | null {
  if (userSquadPlayerIds.length === 0) {
    return null;
  }

  const injuredSquadPlayers = bootstrap.elements.filter(
    (p) => userSquadPlayerIds.includes(p.id) && isInjured(p)
  );

  if (injuredSquadPlayers.length === 0) {
    return null;
  }

  const playerNames = injuredSquadPlayers
    .slice(0, 3)
    .map((p) => p.web_name || `${p.first_name} ${p.second_name}`)
    .join(', ');

  const moreCount = injuredSquadPlayers.length - 3;
  const message =
    moreCount > 0
      ? `${injuredSquadPlayers.length} player${injuredSquadPlayers.length > 1 ? 's' : ''} in your squad have injury concerns: ${playerNames} and ${moreCount} more`
      : `${injuredSquadPlayers.length} player${injuredSquadPlayers.length > 1 ? 's' : ''} in your squad ${injuredSquadPlayers.length > 1 ? 'have' : 'has'} injury concerns: ${playerNames}`;

  return {
    count: injuredSquadPlayers.length,
    players: injuredSquadPlayers,
    message,
  };
}

// Function to calculate favorite team injury alerts (matches dashboard logic)
function calculateFavoriteTeamInjuries(
  bootstrap: Bootstrap,
  favoriteTeamId: number
): {
  count: number;
  players: Player[];
  message: string;
} | null {
  if (!favoriteTeamId) {
    return null;
  }

  const injuredTeamPlayers = bootstrap.elements.filter(
    (p) => p.team === favoriteTeamId && isInjured(p)
  );

  if (injuredTeamPlayers.length === 0) {
    return null;
  }

  const teamName =
    bootstrap.teams?.find((t) => t.id === favoriteTeamId)?.short_name || 'your team';

  const playerNames = injuredTeamPlayers
    .slice(0, 3)
    .map((p) => p.web_name || `${p.first_name} ${p.second_name}`)
    .join(', ');

  const moreCount = injuredTeamPlayers.length - 3;
  const message =
    moreCount > 0
      ? `${injuredTeamPlayers.length} ${teamName} player${injuredTeamPlayers.length > 1 ? 's' : ''} have injury concerns: ${playerNames} and ${moreCount} more`
      : `${injuredTeamPlayers.length} ${teamName} player${injuredTeamPlayers.length > 1 ? 's' : ''} ${injuredTeamPlayers.length > 1 ? 'have' : 'has'} injury concerns: ${playerNames}`;

  return {
    count: injuredTeamPlayers.length,
    players: injuredTeamPlayers,
    message,
  };
}

describe('Personalized Alerts - Injury Detection', () => {
  describe('isInjured() function', () => {
    it('should detect injury from news field', () => {
      const player: Player = {
        id: 1,
        web_name: 'Test Player',
        team: 1,
        news: 'Player has an injury concern',
        chance_of_playing_next_round: null,
      };
      expect(isInjured(player)).toBe(true);
    });

    it('should detect injury from low chance of playing', () => {
      const player: Player = {
        id: 2,
        web_name: 'Test Player 2',
        team: 1,
        chance_of_playing_next_round: 50,
      };
      expect(isInjured(player)).toBe(true);
    });

    it('should not detect injury if chance is >= 75', () => {
      const player: Player = {
        id: 3,
        web_name: 'Test Player 3',
        team: 1,
        chance_of_playing_next_round: 80,
      };
      expect(isInjured(player)).toBe(false);
    });

    it('should handle null chance_of_playing_next_round', () => {
      const player: Player = {
        id: 4,
        web_name: 'Test Player 4',
        team: 1,
        chance_of_playing_next_round: null,
        news: 'No injury',
      };
      expect(isInjured(player)).toBe(false);
    });

    it('should be case-insensitive for injury news', () => {
      const player: Player = {
        id: 5,
        web_name: 'Test Player 5',
        team: 1,
        news: 'INJURY concern',
        chance_of_playing_next_round: null,
      };
      expect(isInjured(player)).toBe(true);
    });
  });

  describe('FPL Squad Injury Alerts', () => {
    const mockBootstrap: Bootstrap = {
      elements: [
        {
          id: 1,
          web_name: 'Salah',
          team: 1,
          news: 'Injury concern',
          chance_of_playing_next_round: null,
        },
        {
          id: 2,
          web_name: 'Kane',
          team: 2,
          chance_of_playing_next_round: 60,
        },
        {
          id: 3,
          web_name: 'De Bruyne',
          team: 3,
          chance_of_playing_next_round: 80,
        },
        {
          id: 4,
          web_name: 'Haaland',
          team: 1,
          news: 'No issues',
          chance_of_playing_next_round: 90,
        },
      ],
      teams: [],
    };

    it('should only count players in user squad', () => {
      const userSquadIds = [1, 2]; // Salah and Kane in squad
      const result = calculateFPLSquadInjuries(mockBootstrap, userSquadIds);

      expect(result).not.toBeNull();
      expect(result?.count).toBe(2);
      expect(result?.players.map((p) => p.id)).toEqual([1, 2]);
    });

    it('should not count players not in squad', () => {
      const userSquadIds = [3, 4]; // De Bruyne and Haaland (not injured)
      const result = calculateFPLSquadInjuries(mockBootstrap, userSquadIds);

      expect(result).toBeNull();
    });

    it('should return null if no squad players', () => {
      const userSquadIds: number[] = [];
      const result = calculateFPLSquadInjuries(mockBootstrap, userSquadIds);

      expect(result).toBeNull();
    });

    it('should format message correctly for single player', () => {
      const userSquadIds = [1];
      const result = calculateFPLSquadInjuries(mockBootstrap, userSquadIds);

      expect(result?.message).toContain('1 player');
      expect(result?.message).toContain('has injury concerns');
      expect(result?.message).toContain('Salah');
    });

    it('should format message correctly for multiple players', () => {
      const userSquadIds = [1, 2];
      const result = calculateFPLSquadInjuries(mockBootstrap, userSquadIds);

      expect(result?.message).toContain('2 players');
      expect(result?.message).toContain('have injury concerns');
      expect(result?.message).toContain('Salah');
      expect(result?.message).toContain('Kane');
    });

    it('should truncate player names after 3', () => {
      const mockBootstrapMany: Bootstrap = {
        elements: [
          { id: 1, web_name: 'Player1', team: 1, chance_of_playing_next_round: 50 },
          { id: 2, web_name: 'Player2', team: 1, chance_of_playing_next_round: 50 },
          { id: 3, web_name: 'Player3', team: 1, chance_of_playing_next_round: 50 },
          { id: 4, web_name: 'Player4', team: 1, chance_of_playing_next_round: 50 },
          { id: 5, web_name: 'Player5', team: 1, chance_of_playing_next_round: 50 },
        ],
        teams: [],
      };

      const userSquadIds = [1, 2, 3, 4, 5];
      const result = calculateFPLSquadInjuries(mockBootstrapMany, userSquadIds);

      expect(result?.count).toBe(5);
      expect(result?.message).toContain('Player1, Player2, Player3');
      expect(result?.message).toContain('and 2 more');
    });

    it('should handle missing web_name', () => {
      const mockBootstrapNoWebName: Bootstrap = {
        elements: [
          {
            id: 1,
            first_name: 'Mohamed',
            second_name: 'Salah',
            team: 1,
            chance_of_playing_next_round: 50,
          },
        ],
        teams: [],
      };

      const userSquadIds = [1];
      const result = calculateFPLSquadInjuries(mockBootstrapNoWebName, userSquadIds);

      expect(result?.message).toContain('Mohamed Salah');
    });
  });

  describe('Favorite Team Injury Alerts', () => {
    const mockBootstrap: Bootstrap = {
      elements: [
        {
          id: 1,
          web_name: 'Salah',
          team: 1,
          chance_of_playing_next_round: 50,
        },
        {
          id: 2,
          web_name: 'Mane',
          team: 1,
          news: 'Injury',
          chance_of_playing_next_round: null,
        },
        {
          id: 3,
          web_name: 'Kane',
          team: 2,
          chance_of_playing_next_round: 50,
        },
      ],
      teams: [{ id: 1, short_name: 'LIV' }],
    };

    it('should only count players from favorite team', () => {
      const result = calculateFavoriteTeamInjuries(mockBootstrap, 1);

      expect(result).not.toBeNull();
      expect(result?.count).toBe(2);
      expect(result?.players.map((p) => p.id)).toEqual([1, 2]);
    });

    it('should not count players from other teams', () => {
      const result = calculateFavoriteTeamInjuries(mockBootstrap, 2);

      expect(result).not.toBeNull();
      expect(result?.count).toBe(1);
      expect(result?.players.map((p) => p.id)).toEqual([3]);
    });

    it('should return null if no favorite team', () => {
      const result = calculateFavoriteTeamInjuries(mockBootstrap, 0);

      expect(result).toBeNull();
    });

    it('should return null if no injured players', () => {
      const mockBootstrapNoInjuries: Bootstrap = {
        elements: [
          {
            id: 1,
            web_name: 'Salah',
            team: 1,
            chance_of_playing_next_round: 90,
          },
        ],
        teams: [{ id: 1, short_name: 'LIV' }],
      };

      const result = calculateFavoriteTeamInjuries(mockBootstrapNoInjuries, 1);

      expect(result).toBeNull();
    });

    it('should include team name in message', () => {
      const result = calculateFavoriteTeamInjuries(mockBootstrap, 1);

      expect(result?.message).toContain('LIV');
    });

    it('should fall back to "your team" if team name missing', () => {
      const mockBootstrapNoTeam: Bootstrap = {
        elements: [
          {
            id: 1,
            web_name: 'Salah',
            team: 1,
            chance_of_playing_next_round: 50,
          },
        ],
        teams: [],
      };

      const result = calculateFavoriteTeamInjuries(mockBootstrapNoTeam, 1);

      expect(result?.message).toContain('your team');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty bootstrap elements', () => {
      const mockBootstrap: Bootstrap = {
        elements: [],
        teams: [],
      };

      const result = calculateFPLSquadInjuries(mockBootstrap, [1, 2]);
      expect(result).toBeNull();
    });

    it('should handle players not in bootstrap', () => {
      const mockBootstrap: Bootstrap = {
        elements: [
          {
            id: 1,
            web_name: 'Salah',
            team: 1,
            chance_of_playing_next_round: 90,
          },
        ],
        teams: [],
      };

      const result = calculateFPLSquadInjuries(mockBootstrap, [999]); // Player not in bootstrap
      expect(result).toBeNull();
    });

    it('should handle missing first_name and second_name', () => {
      const mockBootstrap: Bootstrap = {
        elements: [
          {
            id: 1,
            team: 1,
            chance_of_playing_next_round: 50,
          },
        ],
        teams: [],
      };

      const userSquadIds = [1];
      const result = calculateFPLSquadInjuries(mockBootstrap, userSquadIds);

      // Should handle gracefully - web_name would be undefined, fallback would be empty
      expect(result).not.toBeNull();
    });
  });
});

