import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewsContextBadge from '../NewsContextBadge';

describe('NewsContextBadge', () => {
  it('renders favorite team badge', () => {
    render(<NewsContextBadge context="favorite-team" />);

    expect(screen.getByText('Your favorite team')).toBeInTheDocument();
  });

  it('renders FPL player badge without player name', () => {
    render(<NewsContextBadge context="fpl-player" />);

    expect(screen.getByText('Your FPL player')).toBeInTheDocument();
  });

  it('renders FPL player badge with player name', () => {
    render(<NewsContextBadge context="fpl-player" playerName="Salah" />);

    expect(screen.getByText('Your FPL player: Salah')).toBeInTheDocument();
  });

  it('renders trending badge', () => {
    render(<NewsContextBadge context="trending" />);

    expect(screen.getByText('Trending')).toBeInTheDocument();
  });

  it('renders breaking badge', () => {
    render(<NewsContextBadge context="breaking" />);

    expect(screen.getByText('Breaking')).toBeInTheDocument();
  });

  it('applies correct color for favorite team', () => {
    const { container } = render(<NewsContextBadge context="favorite-team" />);

    const badge = container.querySelector('span');
    expect(badge?.className).toContain('bg-[var(--pl-cyan)]');
  });

  it('applies correct color for FPL player', () => {
    const { container } = render(<NewsContextBadge context="fpl-player" />);

    const badge = container.querySelector('span');
    expect(badge?.className).toContain('bg-[var(--pl-green)]');
  });

  it('applies correct color for trending', () => {
    const { container } = render(<NewsContextBadge context="trending" />);

    const badge = container.querySelector('span');
    expect(badge?.className).toContain('bg-[var(--pl-purple)]');
  });

  it('applies correct color for breaking', () => {
    const { container } = render(<NewsContextBadge context="breaking" />);

    const badge = container.querySelector('span');
    expect(badge?.className).toContain('bg-[var(--pl-pink)]');
  });

  it('applies white text color', () => {
    const { container } = render(<NewsContextBadge context="favorite-team" />);

    const badge = container.querySelector('span');
    expect(badge?.className).toContain('text-white');
  });

  it('applies correct styling classes', () => {
    const { container } = render(<NewsContextBadge context="favorite-team" />);

    const badge = container.querySelector('span');
    expect(badge?.className).toContain('px-2');
    expect(badge?.className).toContain('py-1');
    expect(badge?.className).toContain('rounded');
    expect(badge?.className).toContain('text-xs');
    expect(badge?.className).toContain('font-semibold');
  });

  it('handles different player names', () => {
    render(<NewsContextBadge context="fpl-player" playerName="Haaland" />);

    expect(screen.getByText('Your FPL player: Haaland')).toBeInTheDocument();
  });

  it('handles empty player name', () => {
    render(<NewsContextBadge context="fpl-player" playerName="" />);

    expect(screen.getByText('Your FPL player: ')).toBeInTheDocument();
  });
});

