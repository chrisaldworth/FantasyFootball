import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PerformanceChart from '../PerformanceChart';

// Mock the chart components
jest.mock('@/components/PointsChart', () => {
  return function MockPointsChart({ history, timeRange }: any) {
    return <div data-testid="points-chart">PointsChart: {timeRange}</div>;
  };
});

jest.mock('@/components/RankChart', () => {
  return function MockRankChart({ history, timeRange }: any) {
    return <div data-testid="rank-chart">RankChart: {timeRange}</div>;
  };
});

describe('PerformanceChart', () => {
  const mockHistory = [
    { event: 1, points: 50, total_points: 50, overall_rank: 1000000, rank: 1000000 },
    { event: 2, points: 60, total_points: 110, overall_rank: 950000, rank: 950000 },
    { event: 3, points: 45, total_points: 155, overall_rank: 980000, rank: 980000 },
    { event: 4, points: 70, total_points: 225, overall_rank: 900000, rank: 900000 },
    { event: 5, points: 55, total_points: 280, overall_rank: 920000, rank: 920000 },
    { event: 6, points: 65, total_points: 345, overall_rank: 880000, rank: 880000 },
  ];

  it('renders with history data', () => {
    render(<PerformanceChart history={mockHistory} />);
    
    expect(screen.getByText('Recent Performance')).toBeInTheDocument();
    expect(screen.getByTestId('points-chart')).toBeInTheDocument();
    expect(screen.getByTestId('rank-chart')).toBeInTheDocument();
  });

  it('renders empty state when no history', () => {
    render(<PerformanceChart history={null} />);
    
    expect(screen.getByText('Recent Performance')).toBeInTheDocument();
    expect(screen.getByText('No performance data available')).toBeInTheDocument();
    expect(screen.queryByTestId('points-chart')).not.toBeInTheDocument();
  });

  it('renders empty state when empty array', () => {
    render(<PerformanceChart history={[]} />);
    
    expect(screen.getByText('No performance data available')).toBeInTheDocument();
  });

  it('defaults to last5 time range', () => {
    render(<PerformanceChart history={mockHistory} />);
    
    expect(screen.getByTestId('points-chart')).toHaveTextContent('PointsChart: last5');
    expect(screen.getByTestId('rank-chart')).toHaveTextContent('RankChart: last5');
  });

  it('uses provided timeRange prop', () => {
    render(<PerformanceChart history={mockHistory} timeRange="last10" />);
    
    expect(screen.getByTestId('points-chart')).toHaveTextContent('PointsChart: last10');
    expect(screen.getByTestId('rank-chart')).toHaveTextContent('RankChart: last10');
  });

  it('switches to last5 when button clicked', async () => {
    const user = userEvent.setup();
    render(<PerformanceChart history={mockHistory} timeRange="last10" />);
    
    const last5Button = screen.getByText('Last 5');
    await user.click(last5Button);
    
    expect(screen.getByTestId('points-chart')).toHaveTextContent('PointsChart: last5');
  });

  it('switches to last10 when button clicked', async () => {
    const user = userEvent.setup();
    render(<PerformanceChart history={mockHistory} timeRange="last5" />);
    
    const last10Button = screen.getByText('Last 10');
    await user.click(last10Button);
    
    expect(screen.getByTestId('points-chart')).toHaveTextContent('PointsChart: last10');
  });

  it('highlights active time range button', () => {
    render(<PerformanceChart history={mockHistory} timeRange="last5" />);
    
    const last5Button = screen.getByText('Last 5');
    const last10Button = screen.getByText('Last 10');
    
    expect(last5Button.className).toContain('bg-[var(--fpl-primary)]');
    expect(last10Button.className).not.toContain('bg-[var(--fpl-primary)]');
  });

  it('calculates and displays average points', () => {
    render(<PerformanceChart history={mockHistory} />);
    
    // Average of last 5: (60 + 45 + 70 + 55 + 65) / 5 = 59
    expect(screen.getByText('59')).toBeInTheDocument();
  });

  it('calculates and displays best gameweek', () => {
    render(<PerformanceChart history={mockHistory} />);
    
    // Best GW in last 5: GW4 with 70 points
    expect(screen.getByText(/GW4: 70/)).toBeInTheDocument();
  });

  it('calculates and displays worst gameweek', () => {
    render(<PerformanceChart history={mockHistory} />);
    
    // Worst GW in last 5: GW3 with 45 points
    expect(screen.getByText(/GW3: 45/)).toBeInTheDocument();
  });

  it('recalculates stats when time range changes', async () => {
    const user = userEvent.setup();
    render(<PerformanceChart history={mockHistory} />);
    
    // Initially shows last 5 stats
    expect(screen.getByText('59')).toBeInTheDocument();
    
    // Switch to last 10 (should show all 6)
    const last10Button = screen.getByText('Last 10');
    await user.click(last10Button);
    
    // Average of all 6: (50 + 60 + 45 + 70 + 55 + 65) / 6 = 57.5
    expect(screen.getByText('57.5')).toBeInTheDocument();
  });

  it('handles single gameweek in history', () => {
    const singleHistory = [mockHistory[0]];
    render(<PerformanceChart history={singleHistory} />);
    
    expect(screen.getByText('50')).toBeInTheDocument(); // Average = 50
    expect(screen.getByText(/GW1: 50/)).toBeInTheDocument(); // Best = GW1
    expect(screen.getByText(/GW1: 50/)).toBeInTheDocument(); // Worst = GW1
  });

  it('renders stats section with correct labels', () => {
    render(<PerformanceChart history={mockHistory} />);
    
    expect(screen.getByText('Avg Points')).toBeInTheDocument();
    expect(screen.getByText('Best GW')).toBeInTheDocument();
    expect(screen.getByText('Worst GW')).toBeInTheDocument();
  });

  it('does not render stats when no history', () => {
    render(<PerformanceChart history={null} />);
    
    expect(screen.queryByText('Avg Points')).not.toBeInTheDocument();
  });
});

