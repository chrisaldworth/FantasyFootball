import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FPLInjuryAlerts from '../FPLInjuryAlerts';

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

describe('FPLInjuryAlerts', () => {
  const mockInjuredPlayers = [
    {
      id: 1,
      name: 'Player One',
      team: 'Arsenal',
      injuryStatus: 'Injured',
      chanceOfPlaying: 25,
    },
    {
      id: 2,
      name: 'Player Two',
      team: 'Chelsea',
      injuryStatus: 'Doubtful',
      chanceOfPlaying: 50,
    },
  ];

  it('renders nothing when no injured players', () => {
    const { container } = render(<FPLInjuryAlerts injuredPlayers={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders section header', () => {
    render(<FPLInjuryAlerts injuredPlayers={mockInjuredPlayers} />);

    expect(screen.getByText('FPL Squad Injury Concerns')).toBeInTheDocument();
    expect(screen.getByText('⚽')).toBeInTheDocument();
  });

  it('renders all injured players', () => {
    render(<FPLInjuryAlerts injuredPlayers={mockInjuredPlayers} />);

    expect(screen.getByText('Player One')).toBeInTheDocument();
    expect(screen.getByText('Player Two')).toBeInTheDocument();
  });

  it('displays player team', () => {
    render(<FPLInjuryAlerts injuredPlayers={mockInjuredPlayers} />);

    expect(screen.getByText('Arsenal')).toBeInTheDocument();
    expect(screen.getByText('Chelsea')).toBeInTheDocument();
  });

  it('displays chance of playing when available', () => {
    render(<FPLInjuryAlerts injuredPlayers={mockInjuredPlayers} />);

    expect(screen.getByText(/25% chance/)).toBeInTheDocument();
    expect(screen.getByText(/50% chance/)).toBeInTheDocument();
  });

  it('does not display chance of playing when null', () => {
    const playersWithoutChance = [
      {
        id: 1,
        name: 'Player One',
        team: 'Arsenal',
        injuryStatus: 'Injured',
        chanceOfPlaying: null,
      },
    ];

    render(<FPLInjuryAlerts injuredPlayers={playersWithoutChance} />);

    expect(screen.queryByText(/% chance/)).not.toBeInTheDocument();
  });

  it('links to transfers page', () => {
    render(<FPLInjuryAlerts injuredPlayers={mockInjuredPlayers} />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach(link => {
      expect(link).toHaveAttribute('href', '/fantasy-football/transfers');
    });
  });

  it('displays "View Transfer Options" link', () => {
    render(<FPLInjuryAlerts injuredPlayers={mockInjuredPlayers} />);

    const viewLinks = screen.getAllByText('View Transfer Options');
    expect(viewLinks.length).toBe(mockInjuredPlayers.length);
  });

  it('applies correct styling to player cards', () => {
    const { container } = render(
      <FPLInjuryAlerts injuredPlayers={mockInjuredPlayers} />
    );

    const cards = container.querySelectorAll('a');
    cards.forEach(card => {
      expect(card.className).toContain('border-[var(--pl-pink)]');
      expect(card.className).toContain('bg-[var(--pl-pink)]/10');
    });
  });

  it('displays injury icon for each player', () => {
    render(<FPLInjuryAlerts injuredPlayers={mockInjuredPlayers} />);

    const icons = screen.getAllByText('🏥');
    expect(icons.length).toBe(mockInjuredPlayers.length);
  });

  it('renders icon with aria-hidden', () => {
    render(<FPLInjuryAlerts injuredPlayers={mockInjuredPlayers} />);

    const icons = screen.getAllByText('🏥');
    icons.forEach(icon => {
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('handles single injured player', () => {
    const singlePlayer = [mockInjuredPlayers[0]];

    render(<FPLInjuryAlerts injuredPlayers={singlePlayer} />);

    expect(screen.getByText('Player One')).toBeInTheDocument();
    expect(screen.queryByText('Player Two')).not.toBeInTheDocument();
  });

  it('handles multiple injured players', () => {
    const manyPlayers = [
      ...mockInjuredPlayers,
      {
        id: 3,
        name: 'Player Three',
        team: 'Liverpool',
        injuryStatus: 'Injured',
        chanceOfPlaying: 0,
      },
    ];

    render(<FPLInjuryAlerts injuredPlayers={manyPlayers} />);

    expect(screen.getByText('Player One')).toBeInTheDocument();
    expect(screen.getByText('Player Two')).toBeInTheDocument();
    expect(screen.getByText('Player Three')).toBeInTheDocument();
  });
});




