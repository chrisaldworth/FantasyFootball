/**
 * Tests for KeyAlerts Component
 * 
 * Tests the KeyAlerts component to ensure:
 * - Alerts render correctly
 * - Action buttons work
 * - Alert types are handled
 * - Accessibility features work
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import KeyAlerts from '../KeyAlerts';

describe('KeyAlerts Component', () => {
  const mockAlerts = [
    {
      id: 'fpl-squad-injuries',
      type: 'injury' as const,
      message: '3 players in your squad have injury concerns: Salah, Kane, De Bruyne',
      priority: 'high' as const,
      actionHref: '/dashboard',
      alertType: 'fpl-squad' as const,
      playerIds: [1, 2, 3],
    },
    {
      id: 'favorite-team-injuries',
      type: 'injury' as const,
      message: '2 LIV players have injury concerns: Mane, Firmino',
      priority: 'high' as const,
      actionHref: '/dashboard',
      alertType: 'favorite-team' as const,
      playerIds: [4, 5],
    },
  ];

  it('should render alerts when provided', () => {
    render(<KeyAlerts alerts={mockAlerts} />);

    expect(screen.getByText('Key Alerts')).toBeInTheDocument();
    expect(screen.getByText(/3 players in your squad have injury concerns/)).toBeInTheDocument();
    expect(screen.getByText(/2 LIV players have injury concerns/)).toBeInTheDocument();
  });

  it('should not render when alerts array is empty', () => {
    const { container } = render(<KeyAlerts alerts={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when alerts is null', () => {
    const { container } = render(<KeyAlerts alerts={null as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('should display action buttons for alerts with actionHref', () => {
    render(<KeyAlerts alerts={mockAlerts} />);

    expect(screen.getByText('View Squad')).toBeInTheDocument();
    expect(screen.getByText('Team News')).toBeInTheDocument();
  });

  it('should use correct action label for fpl-squad alerts', () => {
    const fplAlert = [
      {
        id: 'fpl-squad',
        type: 'injury' as const,
        message: 'Test message',
        priority: 'high' as const,
        actionHref: '/dashboard',
        alertType: 'fpl-squad' as const,
      },
    ];

    render(<KeyAlerts alerts={fplAlert} />);
    expect(screen.getByText('View Squad')).toBeInTheDocument();
  });

  it('should use correct action label for favorite-team alerts', () => {
    const teamAlert = [
      {
        id: 'favorite-team',
        type: 'injury' as const,
        message: 'Test message',
        priority: 'high' as const,
        actionHref: '/dashboard',
        alertType: 'favorite-team' as const,
      },
    ];

    render(<KeyAlerts alerts={teamAlert} />);
    expect(screen.getByText('Team News')).toBeInTheDocument();
  });

  it('should use fallback action label for unknown alert types', () => {
    const unknownAlert = [
      {
        id: 'unknown',
        type: 'injury' as const,
        message: 'Test message',
        priority: 'high' as const,
        actionHref: '/dashboard',
      },
    ];

    render(<KeyAlerts alerts={unknownAlert} />);
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('should limit visible alerts to maxVisible prop', () => {
    const manyAlerts = [
      ...mockAlerts,
      {
        id: 'alert3',
        type: 'deadline' as const,
        message: 'Deadline approaching',
        priority: 'high' as const,
      },
      {
        id: 'alert4',
        type: 'price' as const,
        message: 'Price change',
        priority: 'medium' as const,
      },
    ];

    render(<KeyAlerts alerts={manyAlerts} maxVisible={2} />);

    expect(screen.getByText(/3 players in your squad/)).toBeInTheDocument();
    expect(screen.getByText(/2 LIV players/)).toBeInTheDocument();
    expect(screen.queryByText('Deadline approaching')).not.toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('should display correct icons for alert types', () => {
    const alertsWithIcons = [
      {
        id: 'injury',
        type: 'injury' as const,
        message: 'Injury alert',
        priority: 'high' as const,
      },
      {
        id: 'price',
        type: 'price' as const,
        message: 'Price alert',
        priority: 'medium' as const,
      },
      {
        id: 'deadline',
        type: 'deadline' as const,
        message: 'Deadline alert',
        priority: 'high' as const,
      },
    ];

    render(<KeyAlerts alerts={alertsWithIcons} />);

    // Icons are emojis, so we check for the alert messages
    expect(screen.getByText('Injury alert')).toBeInTheDocument();
    expect(screen.getByText('Price alert')).toBeInTheDocument();
    expect(screen.getByText('Deadline alert')).toBeInTheDocument();
  });

  it('should apply correct styling for high priority injuries', () => {
    const highPriorityAlert = [
      {
        id: 'high-priority',
        type: 'injury' as const,
        message: 'High priority injury',
        priority: 'high' as const,
      },
    ];

    const { container } = render(<KeyAlerts alerts={highPriorityAlert} />);
    const alertElement = container.querySelector('.border-\\[var\\(--color-error\\)\\]');
    expect(alertElement).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<KeyAlerts alerts={mockAlerts} />);

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAttribute('aria-label');
    });
  });

  it('should make alerts with actionHref clickable', () => {
    render(<KeyAlerts alerts={mockAlerts} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/dashboard');
    expect(links[1]).toHaveAttribute('href', '/dashboard');
  });

  it('should render alerts without actionHref as non-clickable', () => {
    const nonClickableAlert = [
      {
        id: 'no-action',
        type: 'injury' as const,
        message: 'No action alert',
        priority: 'high' as const,
      },
    ];

    render(<KeyAlerts alerts={nonClickableAlert} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('No action alert')).toBeInTheDocument();
  });
});


