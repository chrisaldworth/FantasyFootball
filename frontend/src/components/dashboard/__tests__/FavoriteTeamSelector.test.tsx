import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import FavoriteTeamSelector from '../FavoriteTeamSelector';

// Mock dependencies
jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  footballApi: {
    getUkTeams: jest.fn(),
  },
  fplApi: {
    getBootstrap: jest.fn(),
  },
}));

import { useAuth } from '@/lib/auth-context';
import { footballApi, fplApi } from '@/lib/api';

describe('FavoriteTeamSelector', () => {
  const mockUpdateFavoriteTeamId = jest.fn();
  const mockOnTeamChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      updateFavoriteTeamId: mockUpdateFavoriteTeamId,
    });
  });

  it('renders with current team name', () => {
    render(
      <FavoriteTeamSelector
        currentTeamId={1}
        currentTeamName="Arsenal"
        onTeamChange={mockOnTeamChange}
      />
    );

    expect(screen.getByText('Arsenal')).toBeInTheDocument();
    expect(screen.getByText(/My favourite team:/)).toBeInTheDocument();
  });

  it('renders "Select team" when no team selected', () => {
    render(
      <FavoriteTeamSelector
        currentTeamId={null}
        currentTeamName={null}
        onTeamChange={mockOnTeamChange}
      />
    );

    expect(screen.getByText('Select team')).toBeInTheDocument();
  });

  it('opens dropdown when button clicked', async () => {
    const user = userEvent.setup();
    (footballApi.getUkTeams as jest.Mock).mockResolvedValue({
      teams: [{ id: 1, name: 'Arsenal' }],
    });

    render(
      <FavoriteTeamSelector
        currentTeamId={null}
        currentTeamName={null}
        onTeamChange={mockOnTeamChange}
      />
    );

    const button = screen.getByRole('button', { name: /Select favorite team/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Loading teams...')).toBeInTheDocument();
    });
  });

  it('fetches teams when dropdown opens', async () => {
    const user = userEvent.setup();
    (footballApi.getUkTeams as jest.Mock).mockResolvedValue({
      teams: [{ id: 1, name: 'Arsenal' }, { id: 2, name: 'Chelsea' }],
    });

    render(
      <FavoriteTeamSelector
        currentTeamId={null}
        currentTeamName={null}
        onTeamChange={mockOnTeamChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(footballApi.getUkTeams).toHaveBeenCalled();
    });
  });

  it('displays teams in dropdown', async () => {
    const user = userEvent.setup();
    (footballApi.getUkTeams as jest.Mock).mockResolvedValue({
      teams: [{ id: 1, name: 'Arsenal' }, { id: 2, name: 'Chelsea' }],
    });

    render(
      <FavoriteTeamSelector
        currentTeamId={null}
        currentTeamName={null}
        onTeamChange={mockOnTeamChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Arsenal')).toBeInTheDocument();
      expect(screen.getByText('Chelsea')).toBeInTheDocument();
    });
  });

  it('highlights current team in dropdown', async () => {
    const user = userEvent.setup();
    (footballApi.getUkTeams as jest.Mock).mockResolvedValue({
      teams: [{ id: 1, name: 'Arsenal' }, { id: 2, name: 'Chelsea' }],
    });

    render(
      <FavoriteTeamSelector
        currentTeamId={1}
        currentTeamName="Arsenal"
        onTeamChange={mockOnTeamChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      const arsenalButton = screen.getByText('Arsenal').closest('button');
      expect(arsenalButton?.className).toContain('bg-[var(--pl-green)]/20');
    });
  });

  it('calls onTeamChange when team selected', async () => {
    const user = userEvent.setup();
    (footballApi.getUkTeams as jest.Mock).mockResolvedValue({
      teams: [{ id: 2, name: 'Chelsea' }],
    });
    mockUpdateFavoriteTeamId.mockResolvedValue(undefined);

    render(
      <FavoriteTeamSelector
        currentTeamId={1}
        currentTeamName="Arsenal"
        onTeamChange={mockOnTeamChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Chelsea')).toBeInTheDocument();
    });

    const chelseaButton = screen.getByText('Chelsea');
    await user.click(chelseaButton);

    await waitFor(() => {
      expect(mockUpdateFavoriteTeamId).toHaveBeenCalledWith(2);
      expect(mockOnTeamChange).toHaveBeenCalledWith(2);
    });
  });

  it('closes dropdown when team selected', async () => {
    const user = userEvent.setup();
    (footballApi.getUkTeams as jest.Mock).mockResolvedValue({
      teams: [{ id: 2, name: 'Chelsea' }],
    });
    mockUpdateFavoriteTeamId.mockResolvedValue(undefined);

    render(
      <FavoriteTeamSelector
        currentTeamId={1}
        currentTeamName="Arsenal"
        onTeamChange={mockOnTeamChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Chelsea')).toBeInTheDocument();
    });

    const chelseaButton = screen.getByText('Chelsea');
    await user.click(chelseaButton);

    await waitFor(() => {
      expect(screen.queryByText('Chelsea')).not.toBeInTheDocument();
    });
  });

  it('falls back to FPL teams if football API fails', async () => {
    const user = userEvent.setup();
    (footballApi.getUkTeams as jest.Mock).mockRejectedValue(new Error('API Error'));
    (fplApi.getBootstrap as jest.Mock).mockResolvedValue({
      teams: [{ id: 1, name: 'Arsenal', short_name: 'ARS' }],
    });

    render(
      <FavoriteTeamSelector
        currentTeamId={null}
        currentTeamName={null}
        onTeamChange={mockOnTeamChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(fplApi.getBootstrap).toHaveBeenCalled();
    });
  });

  it('shows loading state while fetching teams', async () => {
    const user = userEvent.setup();
    (footballApi.getUkTeams as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ teams: [] }), 100))
    );

    render(
      <FavoriteTeamSelector
        currentTeamId={null}
        currentTeamName={null}
        onTeamChange={mockOnTeamChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByText('Loading teams...')).toBeInTheDocument();
  });

  it('shows empty state when no teams available', async () => {
    const user = userEvent.setup();
    (footballApi.getUkTeams as jest.Mock).mockResolvedValue({ teams: [] });
    (fplApi.getBootstrap as jest.Mock).mockResolvedValue({ teams: [] });

    render(
      <FavoriteTeamSelector
        currentTeamId={null}
        currentTeamName={null}
        onTeamChange={mockOnTeamChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('No teams available')).toBeInTheDocument();
    });
  });

  it('has proper ARIA attributes', () => {
    render(
      <FavoriteTeamSelector
        currentTeamId={1}
        currentTeamName="Arsenal"
        onTeamChange={mockOnTeamChange}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Select favorite team');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('updates aria-expanded when dropdown opens', async () => {
    const user = userEvent.setup();
    (footballApi.getUkTeams as jest.Mock).mockResolvedValue({ teams: [] });

    render(
      <FavoriteTeamSelector
        currentTeamId={null}
        currentTeamName={null}
        onTeamChange={mockOnTeamChange}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    (footballApi.getUkTeams as jest.Mock).mockResolvedValue({
      teams: [{ id: 1, name: 'Arsenal' }],
    });

    render(
      <div>
        <FavoriteTeamSelector
          currentTeamId={null}
          currentTeamName={null}
          onTeamChange={mockOnTeamChange}
        />
        <div data-testid="outside">Outside</div>
      </div>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Arsenal')).toBeInTheDocument();
    });

    const outside = screen.getByTestId('outside');
    await user.click(outside);

    await waitFor(() => {
      expect(screen.queryByText('Arsenal')).not.toBeInTheDocument();
    });
  });

  it('rotates chevron icon when dropdown opens', async () => {
    const user = userEvent.setup();
    (footballApi.getUkTeams as jest.Mock).mockResolvedValue({ teams: [] });

    const { container } = render(
      <FavoriteTeamSelector
        currentTeamId={null}
        currentTeamName={null}
        onTeamChange={mockOnTeamChange}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg?.className).not.toContain('rotate-180');

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(svg?.className).toContain('rotate-180');
    });
  });
});

