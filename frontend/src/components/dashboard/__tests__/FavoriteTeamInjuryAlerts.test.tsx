import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FavoriteTeamInjuryAlerts from '../FavoriteTeamInjuryAlerts';

describe('FavoriteTeamInjuryAlerts', () => {
  const mockInjuredPlayers = [
    {
      id: 1,
      name: 'Player One',
      position: 'DEF',
      photo: '12345.jpg',
      injuryStatus: 'Injured',
      chanceOfPlaying: 25,
    },
    {
      id: 2,
      name: 'Player Two',
      position: 'MID',
      photo: '67890.jpg',
      injuryStatus: 'Doubtful',
      chanceOfPlaying: 50,
    },
  ];

  it('renders nothing when no injured players', () => {
    const { container } = render(
      <FavoriteTeamInjuryAlerts
        teamName="Arsenal"
        injuredPlayers={[]}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders section header with team name', () => {
    render(
      <FavoriteTeamInjuryAlerts
        teamName="Arsenal"
        injuredPlayers={mockInjuredPlayers}
      />
    );

    expect(screen.getByText('My Team Injury Concerns')).toBeInTheDocument();
    expect(screen.getByText('Arsenal')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders all injured players', () => {
    render(
      <FavoriteTeamInjuryAlerts
        teamName="Arsenal"
        injuredPlayers={mockInjuredPlayers}
      />
    );

    expect(screen.getByText('Player One')).toBeInTheDocument();
    expect(screen.getByText('Player Two')).toBeInTheDocument();
  });

  it('displays player position', () => {
    render(
      <FavoriteTeamInjuryAlerts
        teamName="Arsenal"
        injuredPlayers={mockInjuredPlayers}
      />
    );

    expect(screen.getByText('DEF')).toBeInTheDocument();
    expect(screen.getByText('MID')).toBeInTheDocument();
  });

  it('displays chance of playing when available', () => {
    render(
      <FavoriteTeamInjuryAlerts
        teamName="Arsenal"
        injuredPlayers={mockInjuredPlayers}
      />
    );

    expect(screen.getByText(/25% chance/)).toBeInTheDocument();
    expect(screen.getByText(/50% chance/)).toBeInTheDocument();
  });

  it('displays player photos when available', () => {
    render(
      <FavoriteTeamInjuryAlerts
        teamName="Arsenal"
        injuredPlayers={mockInjuredPlayers}
      />
    );

    const images = screen.getAllByAltText('Player One');
    expect(images.length).toBeGreaterThan(0);
  });

  it('generates correct photo URL', () => {
    render(
      <FavoriteTeamInjuryAlerts
        teamName="Arsenal"
        injuredPlayers={mockInjuredPlayers}
      />
    );

    const image = screen.getByAltText('Player One');
    expect(image).toHaveAttribute(
      'src',
      'https://resources.premierleague.com/premierleague/photos/players/250x250/p12345.png'
    );
  });

  it('displays placeholder when photo is missing', () => {
    const playersWithoutPhoto = [
      {
        id: 1,
        name: 'Player One',
        position: 'DEF',
        photo: null,
        injuryStatus: 'Injured',
        chanceOfPlaying: 25,
      },
    ];

    render(
      <FavoriteTeamInjuryAlerts
        teamName="Arsenal"
        injuredPlayers={playersWithoutPhoto}
      />
    );

    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  it('handles photo load error', () => {
    render(
      <FavoriteTeamInjuryAlerts
        teamName="Arsenal"
        injuredPlayers={mockInjuredPlayers}
      />
    );

    const image = screen.getByAltText('Player One');
    const errorEvent = new Event('error');
    image.dispatchEvent(errorEvent);

    // Image should be hidden on error
    expect(image).toHaveStyle({ display: 'none' });
  });

  it('displays injury status', () => {
    render(
      <FavoriteTeamInjuryAlerts
        teamName="Arsenal"
        injuredPlayers={mockInjuredPlayers}
      />
    );

    expect(screen.getByText('Injured')).toBeInTheDocument();
    expect(screen.getByText('Doubtful')).toBeInTheDocument();
  });

  it('applies correct styling to player cards', () => {
    const { container } = render(
      <FavoriteTeamInjuryAlerts
        teamName="Arsenal"
        injuredPlayers={mockInjuredPlayers}
      />
    );

    const cards = container.querySelectorAll('.rounded-lg');
    cards.forEach(card => {
      expect(card.className).toContain('border-[var(--pl-pink)]');
      expect(card.className).toContain('bg-[var(--pl-pink)]/10');
    });
  });

  it('renders icon with aria-hidden', () => {
    render(
      <FavoriteTeamInjuryAlerts
        teamName="Arsenal"
        injuredPlayers={mockInjuredPlayers}
      />
    );

    const icon = screen.getByText('⚠️');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('handles single injured player', () => {
    const singlePlayer = [mockInjuredPlayers[0]];

    render(
      <FavoriteTeamInjuryAlerts
        teamName="Arsenal"
        injuredPlayers={singlePlayer}
      />
    );

    expect(screen.getByText('Player One')).toBeInTheDocument();
    expect(screen.queryByText('Player Two')).not.toBeInTheDocument();
  });

  it('handles players without chance of playing', () => {
    const playersWithoutChance = [
      {
        id: 1,
        name: 'Player One',
        position: 'DEF',
        photo: '12345.jpg',
        injuryStatus: 'Injured',
        chanceOfPlaying: null,
      },
    ];

    render(
      <FavoriteTeamInjuryAlerts
        teamName="Arsenal"
        injuredPlayers={playersWithoutChance}
      />
    );

    expect(screen.queryByText(/% chance/)).not.toBeInTheDocument();
  });
});

