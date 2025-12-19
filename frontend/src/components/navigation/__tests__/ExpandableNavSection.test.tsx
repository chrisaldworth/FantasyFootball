/**
 * Tests for ExpandableNavSection Component
 * 
 * Tests the ExpandableNavSection component to ensure:
 * - Expand/collapse functionality
 * - Auto-expand when sub-item is active
 * - FPL vs Team color coding
 * - Navigation items work
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExpandableNavSection from '../ExpandableNavSection';

// Mock usePathname
const mockPathname = '/fantasy-football';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('ExpandableNavSection Component', () => {
  const mockItems = [
    { icon: '⚽', label: 'Squad', href: '/fantasy-football/squad' },
    { icon: '📊', label: 'Analytics', href: '/fantasy-football/analytics' },
    { icon: '🏆', label: 'Leagues', href: '/fantasy-football/leagues' },
  ];

  it('should render collapsed by default', () => {
    render(
      <ExpandableNavSection
        type="fpl"
        title="FANTASY FOOTBALL"
        icon="⚽"
        items={mockItems}
      />
    );

    const subMenu = screen.queryByRole('menu');
    expect(subMenu).not.toBeInTheDocument();
  });

  it('should expand when button is clicked', () => {
    render(
      <ExpandableNavSection
        type="fpl"
        title="FANTASY FOOTBALL"
        icon="⚽"
        items={mockItems}
      />
    );

    const button = screen.getByLabelText(/expand/i);
    fireEvent.click(button);

    const subMenu = screen.getByRole('menu');
    expect(subMenu).toBeInTheDocument();
  });

  it('should collapse when expanded and button is clicked', () => {
    render(
      <ExpandableNavSection
        type="fpl"
        title="FANTASY FOOTBALL"
        icon="⚽"
        items={mockItems}
        defaultExpanded={true}
      />
    );

    const button = screen.getByLabelText(/collapse/i);
    fireEvent.click(button);

    const subMenu = screen.queryByRole('menu');
    expect(subMenu).not.toBeInTheDocument();
  });

  it('should auto-expand when sub-item is active', () => {
    // Mock pathname to match one of the items
    jest.spyOn(require('next/navigation'), 'usePathname').mockReturnValue('/fantasy-football/squad');

    render(
      <ExpandableNavSection
        type="fpl"
        title="FANTASY FOOTBALL"
        icon="⚽"
        items={mockItems}
      />
    );

    const subMenu = screen.getByRole('menu');
    expect(subMenu).toBeInTheDocument();
  });

  it('should use FPL colors for FPL section', () => {
    const { container } = render(
      <ExpandableNavSection
        type="fpl"
        title="FANTASY FOOTBALL"
        icon="⚽"
        items={mockItems}
        defaultExpanded={true}
      />
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-[var(--fpl-primary)]/20');
    expect(button).toHaveClass('hover:bg-[var(--fpl-primary)]/30');
  });

  it('should use team colors for team section', () => {
    const { container } = render(
      <ExpandableNavSection
        type="team"
        title="MY TEAM"
        icon="🏆"
        items={mockItems}
        defaultExpanded={true}
      />
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-[var(--team-primary)]/20');
    expect(button).toHaveClass('hover:bg-[var(--team-primary)]/30');
  });

  it('should highlight active sub-item with FPL colors', () => {
    jest.spyOn(require('next/navigation'), 'usePathname').mockReturnValue('/fantasy-football/squad');

    const { container } = render(
      <ExpandableNavSection
        type="fpl"
        title="FANTASY FOOTBALL"
        icon="⚽"
        items={mockItems}
        defaultExpanded={true}
      />
    );

    const activeLink = container.querySelector('a[href="/fantasy-football/squad"]');
    expect(activeLink).toHaveClass('bg-[var(--fpl-primary)]/30');
    expect(activeLink).toHaveClass('text-[var(--fpl-primary)]');
  });

  it('should highlight active sub-item with team colors', () => {
    jest.spyOn(require('next/navigation'), 'usePathname').mockReturnValue('/my-team/fixtures');

    const teamItems = [
      { icon: '📅', label: 'Fixtures', href: '/my-team/fixtures' },
    ];

    const { container } = render(
      <ExpandableNavSection
        type="team"
        title="MY TEAM"
        icon="🏆"
        items={teamItems}
        defaultExpanded={true}
      />
    );

    const activeLink = container.querySelector('a[href="/my-team/fixtures"]');
    expect(activeLink).toHaveClass('bg-[var(--team-primary)]/30');
    expect(activeLink).toHaveClass('text-[var(--team-primary)]');
  });

  it('should display team logo when provided', () => {
    render(
      <ExpandableNavSection
        type="team"
        title="MY TEAM"
        icon="🏆"
        items={mockItems}
        teamLogo="/arsenal-logo.png"
        teamName="Arsenal"
      />
    );

    const logo = screen.getByAltText('Arsenal');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/arsenal-logo.png');
  });

  it('should display icon when no team logo', () => {
    render(
      <ExpandableNavSection
        type="fpl"
        title="FANTASY FOOTBALL"
        icon="⚽"
        items={mockItems}
      />
    );

    const icon = screen.getByText('⚽');
    expect(icon).toBeInTheDocument();
  });

  it('should render all navigation items', () => {
    render(
      <ExpandableNavSection
        type="fpl"
        title="FANTASY FOOTBALL"
        icon="⚽"
        items={mockItems}
        defaultExpanded={true}
      />
    );

    expect(screen.getByText('Squad')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Leagues')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <ExpandableNavSection
        type="fpl"
        title="FANTASY FOOTBALL"
        icon="⚽"
        items={mockItems}
      />
    );

    const button = screen.getByLabelText(/expand/i);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});


