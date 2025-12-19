/**
 * Tests for Drawer Component
 * 
 * Tests the Drawer component to ensure:
 * - Opens and closes correctly
 * - FPL vs Team color coding
 * - Navigation items work
 * - Mobile drawer functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Drawer from '../Drawer';

// Mock usePathname
jest.mock('next/navigation', () => ({
  usePathname: () => '/fantasy-football',
}));

describe('Drawer Component', () => {
  const mockItems = [
    { icon: '⚽', label: 'Squad', href: '/fantasy-football/squad' },
    { icon: '📊', label: 'Analytics', href: '/fantasy-football/analytics' },
  ];

  it('should not be visible when closed', () => {
    const { container } = render(
      <Drawer
        isOpen={false}
        onClose={() => {}}
        type="fpl"
        items={mockItems}
      />
    );

    const drawer = container.firstChild;
    expect(drawer).toHaveClass('opacity-0');
    expect(drawer).toHaveClass('pointer-events-none');
  });

  it('should be visible when open', () => {
    const { container } = render(
      <Drawer
        isOpen={true}
        onClose={() => {}}
        type="fpl"
        items={mockItems}
      />
    );

    const drawer = container.firstChild;
    expect(drawer).toHaveClass('opacity-100');
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    const { container } = render(
      <Drawer
        isOpen={true}
        onClose={onClose}
        type="fpl"
        items={mockItems}
      />
    );

    const backdrop = container.firstChild;
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(
      <Drawer
        isOpen={true}
        onClose={onClose}
        type="fpl"
        items={mockItems}
      />
    );

    const closeButton = screen.getByLabelText('Close menu');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when navigation item is clicked', () => {
    const onClose = jest.fn();
    render(
      <Drawer
        isOpen={true}
        onClose={onClose}
        type="fpl"
        items={mockItems}
      />
    );

    const squadLink = screen.getByText('Squad');
    fireEvent.click(squadLink);
    expect(onClose).toHaveBeenCalled();
  });

  it('should display FPL title and icon for FPL type', () => {
    render(
      <Drawer
        isOpen={true}
        onClose={() => {}}
        type="fpl"
        items={mockItems}
      />
    );

    expect(screen.getByText('FANTASY FOOTBALL')).toBeInTheDocument();
    expect(screen.getByText('⚽')).toBeInTheDocument();
  });

  it('should display team title and icon for team type', () => {
    render(
      <Drawer
        isOpen={true}
        onClose={() => {}}
        type="team"
        items={mockItems}
      />
    );

    expect(screen.getByText('MY TEAM')).toBeInTheDocument();
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  it('should display team logo when provided', () => {
    render(
      <Drawer
        isOpen={true}
        onClose={() => {}}
        type="team"
        items={mockItems}
        teamLogo="/arsenal-logo.png"
        teamName="Arsenal"
      />
    );

    const logo = screen.getByAltText('Arsenal');
    expect(logo).toBeInTheDocument();
  });

  it('should highlight active item with FPL colors', () => {
    jest.spyOn(require('next/navigation'), 'usePathname').mockReturnValue('/fantasy-football/squad');

    const { container } = render(
      <Drawer
        isOpen={true}
        onClose={() => {}}
        type="fpl"
        items={mockItems}
      />
    );

    const activeLink = container.querySelector('a[href="/fantasy-football/squad"]');
    expect(activeLink).toHaveClass('bg-[var(--fpl-primary)]/30');
    expect(activeLink).toHaveClass('text-[var(--fpl-primary)]');
  });

  it('should highlight active item with team colors', () => {
    jest.spyOn(require('next/navigation'), 'usePathname').mockReturnValue('/my-team/fixtures');

    const teamItems = [
      { icon: '📅', label: 'Fixtures', href: '/my-team/fixtures' },
    ];

    const { container } = render(
      <Drawer
        isOpen={true}
        onClose={() => {}}
        type="team"
        items={teamItems}
      />
    );

    const activeLink = container.querySelector('a[href="/my-team/fixtures"]');
    expect(activeLink).toHaveClass('bg-[var(--team-primary)]/30');
    expect(activeLink).toHaveClass('text-[var(--team-primary)]');
  });

  it('should render all navigation items', () => {
    render(
      <Drawer
        isOpen={true}
        onClose={() => {}}
        type="fpl"
        items={mockItems}
      />
    );

    expect(screen.getByText('Squad')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    const { container } = render(
      <Drawer
        isOpen={true}
        onClose={() => {}}
        type="fpl"
        items={mockItems}
      />
    );

    const dialog = container.firstChild;
    expect(dialog).toHaveAttribute('role', 'dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should not close when drawer content is clicked', () => {
    const onClose = jest.fn();
    const { container } = render(
      <Drawer
        isOpen={true}
        onClose={onClose}
        type="fpl"
        items={mockItems}
      />
    );

    const drawerContent = container.querySelector('.absolute.bottom-0');
    fireEvent.click(drawerContent!);
    expect(onClose).not.toHaveBeenCalled();
  });
});

