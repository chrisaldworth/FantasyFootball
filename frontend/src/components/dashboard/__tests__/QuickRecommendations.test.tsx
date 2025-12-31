import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuickRecommendations from '../QuickRecommendations';

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

describe('QuickRecommendations', () => {
  const mockTransferRecommendation = {
    playerIn: { id: 1, name: 'Player In' },
    playerOut: { id: 2, name: 'Player Out' },
    reason: 'Better form and fixtures',
  };

  const mockCaptainRecommendation = {
    player: { id: 3, name: 'Captain Player' },
    reason: 'High expected points',
  };

  it('renders nothing when no recommendations', () => {
    const { container } = render(
      <QuickRecommendations
        transferRecommendation={undefined}
        captainRecommendation={undefined}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders section header', () => {
    render(
      <QuickRecommendations
        transferRecommendation={mockTransferRecommendation}
        captainRecommendation={undefined}
      />
    );

    expect(screen.getByText('Quick Recommendations')).toBeInTheDocument();
    expect(screen.getByText('💡')).toBeInTheDocument();
  });

  it('renders transfer recommendation', () => {
    render(
      <QuickRecommendations
        transferRecommendation={mockTransferRecommendation}
        captainRecommendation={undefined}
      />
    );

    expect(screen.getByText('Transfer Recommendation')).toBeInTheDocument();
    expect(screen.getByText('Player In')).toBeInTheDocument();
    expect(screen.getByText('Player Out')).toBeInTheDocument();
    expect(screen.getByText('Better form and fixtures')).toBeInTheDocument();
  });

  it('renders captain recommendation', () => {
    render(
      <QuickRecommendations
        transferRecommendation={undefined}
        captainRecommendation={mockCaptainRecommendation}
      />
    );

    expect(screen.getByText('Captain Recommendation')).toBeInTheDocument();
    expect(screen.getByText('Captain Player')).toBeInTheDocument();
    expect(screen.getByText('High expected points')).toBeInTheDocument();
  });

  it('renders both recommendations', () => {
    render(
      <QuickRecommendations
        transferRecommendation={mockTransferRecommendation}
        captainRecommendation={mockCaptainRecommendation}
      />
    );

    expect(screen.getByText('Transfer Recommendation')).toBeInTheDocument();
    expect(screen.getByText('Captain Recommendation')).toBeInTheDocument();
  });

  it('links to transfers page for transfer recommendation', () => {
    render(
      <QuickRecommendations
        transferRecommendation={mockTransferRecommendation}
        captainRecommendation={undefined}
      />
    );

    const link = screen.getByText('Make Transfer').closest('a');
    expect(link).toHaveAttribute('href', '/fantasy-football/transfers');
  });

  it('links to captain page for captain recommendation', () => {
    render(
      <QuickRecommendations
        transferRecommendation={undefined}
        captainRecommendation={mockCaptainRecommendation}
      />
    );

    const link = screen.getByText('Set Captain').closest('a');
    expect(link).toHaveAttribute('href', '/fantasy-football/captain');
  });

  it('displays transfer icons', () => {
    render(
      <QuickRecommendations
        transferRecommendation={mockTransferRecommendation}
        captainRecommendation={undefined}
      />
    );

    expect(screen.getByText('🔄')).toBeInTheDocument();
  });

  it('displays captain icon', () => {
    render(
      <QuickRecommendations
        transferRecommendation={undefined}
        captainRecommendation={mockCaptainRecommendation}
      />
    );

    expect(screen.getByText('👑')).toBeInTheDocument();
  });

  it('applies correct styling to recommendation cards', () => {
    const { container } = render(
      <QuickRecommendations
        transferRecommendation={mockTransferRecommendation}
        captainRecommendation={undefined}
      />
    );

    const card = container.querySelector('.border-\\[var\\(--pl-green\\)\\]');
    expect(card).toBeInTheDocument();
    expect(card?.className).toContain('bg-[var(--pl-green)]/10');
  });

  it('renders icons with aria-hidden', () => {
    render(
      <QuickRecommendations
        transferRecommendation={mockTransferRecommendation}
        captainRecommendation={mockCaptainRecommendation}
      />
    );

    const icons = screen.getAllByText(/🔄|👑|💡/);
    icons.forEach(icon => {
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('displays player names in transfer recommendation', () => {
    render(
      <QuickRecommendations
        transferRecommendation={mockTransferRecommendation}
        captainRecommendation={undefined}
      />
    );

    expect(screen.getByText(/Transfer In:/)).toBeInTheDocument();
    expect(screen.getByText(/Transfer Out:/)).toBeInTheDocument();
  });

  it('displays player name in captain recommendation', () => {
    render(
      <QuickRecommendations
        transferRecommendation={undefined}
        captainRecommendation={mockCaptainRecommendation}
      />
    );

    expect(screen.getByText(/Captain:/)).toBeInTheDocument();
  });
});




