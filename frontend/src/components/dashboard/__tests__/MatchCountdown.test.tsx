import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MatchCountdown from '../MatchCountdown';

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

describe('MatchCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders countdown with minutes', () => {
    const futureDate = new Date(Date.now() + 120 * 60 * 1000); // 120 minutes from now

    render(
      <MatchCountdown
        matchDate={futureDate}
        opponent="Chelsea"
        isHome={true}
      />
    );

    expect(screen.getByText(/Your next Team's match is in/)).toBeInTheDocument();
    expect(screen.getByText('120 minutes')).toBeInTheDocument();
    expect(screen.getByText('vs Chelsea')).toBeInTheDocument();
  });

  it('displays home match correctly', () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);

    render(
      <MatchCountdown
        matchDate={futureDate}
        opponent="Chelsea"
        isHome={true}
      />
    );

    expect(screen.getByText('vs Chelsea')).toBeInTheDocument();
  });

  it('displays away match correctly', () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);

    render(
      <MatchCountdown
        matchDate={futureDate}
        opponent="Chelsea"
        isHome={false}
      />
    );

    expect(screen.getByText('at Chelsea')).toBeInTheDocument();
  });

  it('updates countdown every minute', async () => {
    const futureDate = new Date(Date.now() + 120 * 60 * 1000);

    render(
      <MatchCountdown
        matchDate={futureDate}
        opponent="Chelsea"
        isHome={true}
      />
    );

    expect(screen.getByText('120 minutes')).toBeInTheDocument();

    // Fast-forward 1 minute
    jest.advanceTimersByTime(60 * 1000);

    await waitFor(() => {
      expect(screen.getByText('119 minutes')).toBeInTheDocument();
    });
  });

  it('renders match link when provided', () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);

    render(
      <MatchCountdown
        matchDate={futureDate}
        opponent="Chelsea"
        isHome={true}
        matchLink="/match/123"
      />
    );

    const link = screen.getByText('View Match Details').closest('a');
    expect(link).toHaveAttribute('href', '/match/123');
  });

  it('does not render match link when not provided', () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);

    render(
      <MatchCountdown
        matchDate={futureDate}
        opponent="Chelsea"
        isHome={true}
      />
    );

    expect(screen.queryByText('View Match Details')).not.toBeInTheDocument();
  });

  it('handles string date format', () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    render(
      <MatchCountdown
        matchDate={futureDate}
        opponent="Chelsea"
        isHome={true}
      />
    );

    expect(screen.getByText(/minutes/)).toBeInTheDocument();
  });

  it('returns null when match is in the past', () => {
    const pastDate = new Date(Date.now() - 60 * 60 * 1000);

    const { container } = render(
      <MatchCountdown
        matchDate={pastDate}
        opponent="Chelsea"
        isHome={true}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when minutes is negative', () => {
    const pastDate = new Date(Date.now() - 1000);

    const { container } = render(
      <MatchCountdown
        matchDate={pastDate}
        opponent="Chelsea"
        isHome={true}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('formats minutes correctly', () => {
    const futureDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    render(
      <MatchCountdown
        matchDate={futureDate}
        opponent="Chelsea"
        isHome={true}
      />
    );

    expect(screen.getByText('5 minutes')).toBeInTheDocument();
  });

  it('handles large minute values', () => {
    const futureDate = new Date(Date.now() + 1440 * 60 * 1000); // 24 hours

    render(
      <MatchCountdown
        matchDate={futureDate}
        opponent="Chelsea"
        isHome={true}
      />
    );

    expect(screen.getByText('1440 minutes')).toBeInTheDocument();
  });

  it('cleans up interval on unmount', () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = render(
      <MatchCountdown
        matchDate={futureDate}
        opponent="Chelsea"
        isHome={true}
      />
    );

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});

