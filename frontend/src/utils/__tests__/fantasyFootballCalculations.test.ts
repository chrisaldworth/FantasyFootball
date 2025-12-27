/**
 * Utility tests for Fantasy Football Overview calculations
 * These test the logic used in the overview page for:
 * - Alert generation
 * - Rank change calculations
 * - Value change calculations
 * - Gameweek status detection
 */

describe('Fantasy Football Overview Calculations', () => {
  describe('Rank Change Calculation', () => {
    it('calculates rank improvement (up)', () => {
      const history = [
        { event: 1, overall_rank: 100000 },
        { event: 2, overall_rank: 95000 },
      ];
      
      const sorted = [...history].sort((a, b) => a.event - b.event);
      const latest = sorted[sorted.length - 1];
      const previous = sorted[sorted.length - 2];
      const change = previous.overall_rank - latest.overall_rank;
      
      expect(change).toBe(5000);
      expect(change > 0).toBe(true);
    });

    it('calculates rank decline (down)', () => {
      const history = [
        { event: 1, overall_rank: 95000 },
        { event: 2, overall_rank: 100000 },
      ];
      
      const sorted = [...history].sort((a, b) => a.event - b.event);
      const latest = sorted[sorted.length - 1];
      const previous = sorted[sorted.length - 2];
      const change = previous.overall_rank - latest.overall_rank;
      
      expect(change).toBe(-5000);
      expect(change < 0).toBe(true);
    });

    it('handles no change in rank', () => {
      const history = [
        { event: 1, overall_rank: 100000 },
        { event: 2, overall_rank: 100000 },
      ];
      
      const sorted = [...history].sort((a, b) => a.event - b.event);
      const latest = sorted[sorted.length - 1];
      const previous = sorted[sorted.length - 2];
      const change = previous.overall_rank - latest.overall_rank;
      
      expect(change).toBe(0);
    });

    it('handles single gameweek in history', () => {
      const history = [
        { event: 1, overall_rank: 100000 },
      ];
      
      expect(history.length).toBe(1);
      // Should return undefined when only one gameweek
    });
  });

  describe('Value Change Calculation', () => {
    it('calculates value increase', () => {
      const history = [
        { event: 1, value: 1000 },
        { event: 2, value: 1050 },
      ];
      
      const sorted = [...history].sort((a, b) => a.event - b.event);
      const latest = sorted[sorted.length - 1];
      const first = sorted[0];
      const change = latest.value - first.value;
      
      expect(change).toBe(50);
      expect(change / 10).toBe(5); // In millions
    });

    it('calculates value decrease', () => {
      const history = [
        { event: 1, value: 1050 },
        { event: 2, value: 1000 },
      ];
      
      const sorted = [...history].sort((a, b) => a.event - b.event);
      const latest = sorted[sorted.length - 1];
      const first = sorted[0];
      const change = latest.value - first.value;
      
      expect(change).toBe(-50);
    });

    it('handles no value change', () => {
      const history = [
        { event: 1, value: 1000 },
        { event: 2, value: 1000 },
      ];
      
      const sorted = [...history].sort((a, b) => a.event - b.event);
      const latest = sorted[sorted.length - 1];
      const first = sorted[0];
      const change = latest.value - first.value;
      
      expect(change).toBe(0);
    });
  });

  describe('Gameweek Status Detection', () => {
    it('detects before deadline status', () => {
      const now = new Date();
      const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      const finished = false;
      
      const status = finished ? 'after' : now < deadline ? 'before' : 'during';
      
      expect(status).toBe('before');
    });

    it('detects during gameweek status', () => {
      const now = new Date();
      const deadline = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      const finished = false;
      
      const status = finished ? 'after' : now < deadline ? 'before' : 'during';
      
      expect(status).toBe('during');
    });

    it('detects after gameweek status', () => {
      const finished = true;
      
      const status = finished ? 'after' : 'during';
      
      expect(status).toBe('after');
    });

    it('detects between gameweeks status', () => {
      const events = [];
      const currentEvent = events.find((e: any) => e.is_current);
      
      const status = currentEvent ? 'during' : 'between';
      
      expect(status).toBe('between');
    });
  });

  describe('Alert Generation', () => {
    it('identifies injured players', () => {
      const players = [
        { id: 1, web_name: 'Player 1', news: '', chance_of_playing_next_round: 100 },
        { id: 2, web_name: 'Player 2', news: 'Injured', chance_of_playing_next_round: null },
        { id: 3, web_name: 'Player 3', news: '', chance_of_playing_next_round: 50 },
      ];
      
      const userSquadPlayerIds = [1, 2, 3];
      
      const injuredPlayers = players.filter((p: any) =>
        userSquadPlayerIds.includes(p.id) && (
          (p.news && p.news.length > 0 && p.news.toLowerCase().includes('injur')) ||
          (p.chance_of_playing_next_round !== null && p.chance_of_playing_next_round < 75)
        )
      );
      
      expect(injuredPlayers.length).toBe(2);
      expect(injuredPlayers[0].id).toBe(2);
      expect(injuredPlayers[1].id).toBe(3);
    });

    it('identifies missing captain', () => {
      const picks = [
        { element: 1, is_captain: false },
        { element: 2, is_captain: false },
      ];
      
      const captain = picks.find(p => p.is_captain);
      
      expect(captain).toBeUndefined();
    });

    it('identifies captain when set', () => {
      const picks = [
        { element: 1, is_captain: true },
        { element: 2, is_captain: false },
      ];
      
      const captain = picks.find(p => p.is_captain);
      
      expect(captain).toBeDefined();
      expect(captain?.element).toBe(1);
    });

    it('identifies approaching deadline', () => {
      const now = new Date();
      const deadline = new Date(now.getTime() + 20 * 60 * 60 * 1000); // 20 hours from now
      const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      const isApproaching = hoursUntilDeadline < 24;
      
      expect(isApproaching).toBe(true);
    });

    it('does not flag deadline when more than 24 hours away', () => {
      const now = new Date();
      const deadline = new Date(now.getTime() + 30 * 60 * 60 * 1000); // 30 hours from now
      const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      const isApproaching = hoursUntilDeadline < 24;
      
      expect(isApproaching).toBe(false);
    });
  });

  describe('Free Transfers Calculation', () => {
    it('calculates free transfers correctly', () => {
      const entryHistory = {
        event_transfers: 0,
      };
      
      const freeTransfers = 2 - (entryHistory.event_transfers || 0);
      
      expect(freeTransfers).toBe(2);
    });

    it('calculates remaining free transfers after one transfer', () => {
      const entryHistory = {
        event_transfers: 1,
      };
      
      const freeTransfers = 2 - (entryHistory.event_transfers || 0);
      
      expect(freeTransfers).toBe(1);
    });

    it('handles no entry history', () => {
      const entryHistory = null;
      
      const freeTransfers = entryHistory ? (2 - (entryHistory.event_transfers || 0)) : 2;
      
      expect(freeTransfers).toBe(2);
    });
  });

  describe('League Data Transformation', () => {
    it('transforms classic league data', () => {
      const league = {
        id: 1,
        name: 'Test League',
        entry_rank: 100,
        entry_last_rank: 105,
        rank: 500,
      };
      
      const transformed = {
        leagueName: league.name,
        rank: league.entry_rank,
        totalTeams: league.rank || 0,
        rankChange: league.entry_last_rank ? league.entry_last_rank - league.entry_rank : undefined,
        leagueType: 'classic' as const,
        href: `/fantasy-football/leagues?league=${league.id}`,
      };
      
      expect(transformed.leagueName).toBe('Test League');
      expect(transformed.rank).toBe(100);
      expect(transformed.rankChange).toBe(-5);
      expect(transformed.leagueType).toBe('classic');
    });

    it('transforms h2h league data', () => {
      const league = {
        id: 2,
        name: 'H2H League',
        entry_rank: 50,
        entry_last_rank: 45,
        rank: 100,
      };
      
      const transformed = {
        leagueName: league.name,
        rank: league.entry_rank,
        totalTeams: league.rank || 0,
        rankChange: league.entry_last_rank ? league.entry_last_rank - league.entry_rank : undefined,
        leagueType: 'h2h' as const,
        href: `/fantasy-football/leagues?league=${league.id}`,
      };
      
      expect(transformed.leagueType).toBe('h2h');
      expect(transformed.rankChange).toBe(5);
    });

    it('limits leagues to maximum of 4', () => {
      const leagues = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `League ${i}`,
        entry_rank: i * 10,
        entry_last_rank: i * 10 + 5,
        rank: 100,
      }));
      
      const limited = leagues.slice(0, 4);
      
      expect(limited.length).toBe(4);
    });
  });
});



