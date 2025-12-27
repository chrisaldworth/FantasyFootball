import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeagueCard from '../LeagueCard';

describe('LeagueCard', () => {
  const defaultProps = {
    leagueName: 'Test League',
    rank: 1234,
    totalTeams: 5000,
    leagueType: 'classic' as const,
    href: '/leagues/1',
  };

  it('renders with required props', () => {
    render(<LeagueCard {...defaultProps} />);
    
    expect(screen.getByText('Test League')).toBeInTheDocument();
    expect(screen.getByText('#1,234')).toBeInTheDocument();
    expect(screen.getByText('Out of 5,000 teams')).toBeInTheDocument();
  });

  it('renders as a link with correct href', () => {
    render(<LeagueCard {...defaultProps} />);
    
    const link = screen.getByText('Test League').closest('a');
    expect(link).toHaveAttribute('href', '/leagues/1');
  });

  it('displays classic league type', () => {
    render(<LeagueCard {...defaultProps} leagueType="classic" />);
    
    expect(screen.getByText('Classic')).toBeInTheDocument();
  });

  it('displays h2h league type', () => {
    render(<LeagueCard {...defaultProps} leagueType="h2h" />);
    
    expect(screen.getByText('H2H')).toBeInTheDocument();
  });

  it('displays cup league type', () => {
    render(<LeagueCard {...defaultProps} leagueType="cup" />);
    
    expect(screen.getByText('Cup')).toBeInTheDocument();
  });

  it('formats rank with locale string', () => {
    render(<LeagueCard {...defaultProps} rank={1234567} />);
    
    expect(screen.getByText('#1,234,567')).toBeInTheDocument();
  });

  it('formats total teams with locale string', () => {
    render(<LeagueCard {...defaultProps} totalTeams={1000000} />);
    
    expect(screen.getByText('Out of 1,000,000 teams')).toBeInTheDocument();
  });

  it('renders rank change with up direction', () => {
    render(<LeagueCard {...defaultProps} rankChange={5} />);
    
    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders rank change with down direction', () => {
    render(<LeagueCard {...defaultProps} rankChange={-3} />);
    
    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders rank change with zero (neutral)', () => {
    render(<LeagueCard {...defaultProps} rankChange={0} />);
    
    expect(screen.getByText('→')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('does not render rank change when undefined', () => {
    render(<LeagueCard {...defaultProps} />);
    
    expect(screen.queryByText('↑')).not.toBeInTheDocument();
    expect(screen.queryByText('↓')).not.toBeInTheDocument();
    expect(screen.queryByText('→')).not.toBeInTheDocument();
  });

  it('applies correct color for positive rank change', () => {
    const { container } = render(<LeagueCard {...defaultProps} rankChange={5} />);
    
    const changeElement = container.querySelector('.text-sm.font-medium');
    expect(changeElement?.className).toContain('text-[var(--pl-green)]');
  });

  it('applies correct color for negative rank change', () => {
    const { container } = render(<LeagueCard {...defaultProps} rankChange={-3} />);
    
    const changeElement = container.querySelector('.text-sm.font-medium');
    expect(changeElement?.className).toContain('text-[var(--pl-pink)]');
  });

  it('applies correct color for zero rank change', () => {
    const { container } = render(<LeagueCard {...defaultProps} rankChange={0} />);
    
    const changeElement = container.querySelector('.text-sm.font-medium');
    expect(changeElement?.className).toContain('text-[var(--pl-text-muted)]');
  });

  it('uses FPL primary color for rank value', () => {
    const { container } = render(<LeagueCard {...defaultProps} />);
    
    const rankElement = container.querySelector('.text-2xl.font-bold');
    expect(rankElement?.className).toContain('text-[var(--fpl-primary)]');
  });

  it('renders arrow icon with aria-hidden', () => {
    render(<LeagueCard {...defaultProps} rankChange={5} />);
    
    const arrow = screen.getByText('↑');
    expect(arrow).toHaveAttribute('aria-hidden', 'true');
  });

  it('handles very large rank numbers', () => {
    render(<LeagueCard {...defaultProps} rank={999999999} />);
    
    expect(screen.getByText('#999,999,999')).toBeInTheDocument();
  });

  it('handles very large total teams', () => {
    render(<LeagueCard {...defaultProps} totalTeams={999999999} />);
    
    expect(screen.getByText('Out of 999,999,999 teams')).toBeInTheDocument();
  });
});



