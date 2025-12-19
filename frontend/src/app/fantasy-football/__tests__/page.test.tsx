import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FantasyFootballOverviewPage from '../page';

// Mock dependencies
jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  fplApi: {
    getTeam: jest.fn(),
    getTeamHistory: jest.fn(),
    getBootstrap: jest.fn(),
    getTeamPicks: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/components/fantasy-football/MetricCard', () => {
  return function MockMetricCard({ title, value }: any) {
    return <div data-testid="metric-card">{title}: {value}</div>;
  };
});

jest.mock('@/components/fantasy-football/ActionItemsSection', () => {
  return function MockActionItemsSection({ alerts }: any) {
    return <div data-testid="action-items">{alerts.length} alerts</div>;
  };
});

jest.mock('@/components/fantasy-football/PerformanceChart', () => {
  return function MockPerformanceChart() {
    return <div data-testid="performance-chart">Performance Chart</div>;
  };
});

jest.mock('@/components/fantasy-football/LeagueCard', () => {
  return function MockLeagueCard({ leagueName }: any) {
    return <div data-testid="league-card">{leagueName}</div>;
  };
});

jest.mock('@/components/fantasy-football/QuickActionButton', () => {
  return function MockQuickActionButton({ label }: any) {
    return <div data-testid="quick-action">{label}</div>;
  };
});

jest.mock('@/components/pages/FPLPageHeader', () => {
  return function MockFPLPageHeader({ title }: any) {
    return <div data-testid="page-header">{title}</div>;
  };
});

jest.mock('@/components/navigation/SubNavigation', () => {
  return function MockSubNavigation() {
    return <div data-testid="sub-navigation">Sub Navigation</div>;
  };
});

import { useAuth } from '@/lib/auth-context';
import { fplApi } from '@/lib/api';

describe('FantasyFootballOverviewPage', () => {
  const mockUser = {
    id: 1,
    fpl_team_id: 12345,
  };

  const mockTeamData = {
    id: 12345,
    name: 'Test Team',
    summary_overall_points: 1000,
    summary_overall_rank: 50000,
    summary_event_points: 50,
    summary_event_rank: 100000,
    current_event: 10,
    value: 1000,
    leagues: {
      classic: [
        {
          id: 1,
          name: 'Classic League 1',
          entry_rank: 100,
          entry_last_rank: 105,
          rank: 500,
        },
      ],
      h2h: [],
    },
  };

  const mockHistoryData = {
    current: [
      { event: 8, points: 50, total_points: 800, overall_rank: 52000, rank: 52000, bank: 0, value: 1000, event_transfers: 0, event_transfers_cost: 0 },
      { event: 9, points: 60, total_points: 860, overall_rank: 51000, rank: 51000, bank: 0, value: 1000, event_transfers: 0, event_transfers_cost: 0 },
      { event: 10, points: 55, total_points: 915, overall_rank: 50000, rank: 50000, bank: 0, value: 1000, event_transfers: 0, event_transfers_cost: 0 },
    ],
  };

  const mockBootstrapData = {
    events: [
      {
        id: 10,
        is_current: true,
        finished: false,
        deadline_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    elements: [
      { id: 1, web_name: 'Player 1', news: '', chance_of_playing_next_round: 100 },
      { id: 2, web_name: 'Player 2', news: 'Injured', chance_of_playing_next_round: 50 },
    ],
  };

  const mockPicksData = {
    entry_history: {
      event: 10,
      bank: 50,
      value: 1000,
      event_transfers: 0,
      event_transfers_cost: 0,
    },
    picks: [
      { element: 1, position: 1, is_captain: true, is_vice_captain: false },
      { element: 2, position: 2, is_captain: false, is_vice_captain: false },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (fplApi.getTeam as jest.Mock).mockResolvedValue(mockTeamData);
    (fplApi.getTeamHistory as jest.Mock).mockResolvedValue(mockHistoryData);
    (fplApi.getBootstrap as jest.Mock).mockResolvedValue(mockBootstrapData);
    (fplApi.getTeamPicks as jest.Mock).mockResolvedValue(mockPicksData);
  });

  it('renders loading state initially', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    
    render(<FantasyFootballOverviewPage />);
    
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('sub-navigation')).toBeInTheDocument();
  });

  it('renders error state when API fails', async () => {
    (fplApi.getTeam as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<FantasyFootballOverviewPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load FPL data')).toBeInTheDocument();
    });
  });

  it('renders no team state when user has no FPL team', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 1, fpl_team_id: null } });
    
    render(<FantasyFootballOverviewPage />);
    
    expect(screen.getByText('No FPL team linked')).toBeInTheDocument();
  });

  it('renders overview page with all sections when data loaded', async () => {
    render(<FantasyFootballOverviewPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('page-header')).toBeInTheDocument();
      expect(screen.getByTestId('sub-navigation')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('metric-card').length).toBeGreaterThan(0);
    });
  });

  it('fetches all required data in parallel', async () => {
    render(<FantasyFootballOverviewPage />);
    
    await waitFor(() => {
      expect(fplApi.getTeam).toHaveBeenCalledWith(mockUser.fpl_team_id);
      expect(fplApi.getTeamHistory).toHaveBeenCalledWith(mockUser.fpl_team_id);
      expect(fplApi.getBootstrap).toHaveBeenCalled();
    });
  });

  it('fetches team picks for current gameweek', async () => {
    render(<FantasyFootballOverviewPage />);
    
    await waitFor(() => {
      expect(fplApi.getTeamPicks).toHaveBeenCalledWith(mockUser.fpl_team_id, 10);
    });
  });

  it('renders action items section with alerts', async () => {
    render(<FantasyFootballOverviewPage />);
    
    await waitFor(() => {
      const actionItems = screen.getByTestId('action-items');
      expect(actionItems).toBeInTheDocument();
    });
  });

  it('renders performance chart when history data exists', async () => {
    render(<FantasyFootballOverviewPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('performance-chart')).toBeInTheDocument();
    });
  });

  it('renders league cards when leagues exist', async () => {
    render(<FantasyFootballOverviewPage />);
    
    await waitFor(() => {
      const leagueCards = screen.getAllByTestId('league-card');
      expect(leagueCards.length).toBeGreaterThan(0);
    });
  });

  it('renders quick action buttons', async () => {
    render(<FantasyFootballOverviewPage />);
    
    await waitFor(() => {
      const quickActions = screen.getAllByTestId('quick-action');
      expect(quickActions.length).toBeGreaterThan(0);
    });
  });

  it('does not render performance chart when no history', async () => {
    (fplApi.getTeamHistory as jest.Mock).mockResolvedValue({ current: [] });
    
    render(<FantasyFootballOverviewPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('performance-chart')).not.toBeInTheDocument();
    });
  });

  it('does not render league section when no leagues', async () => {
    (fplApi.getTeam as jest.Mock).mockResolvedValue({
      ...mockTeamData,
      leagues: { classic: [], h2h: [] },
    });
    
    render(<FantasyFootballOverviewPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('League Standings')).not.toBeInTheDocument();
    });
  });
});
