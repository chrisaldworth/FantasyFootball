/**
 * Tests for SubNavigation Component
 * 
 * Tests the SubNavigation component to ensure:
 * - FPL vs Team color coding
 * - Active state highlighting
 * - Navigation items work
 * - Sticky positioning
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubNavigation from '../SubNavigation';

// Mock usePathname
jest.mock('next/navigation', () => ({
  usePathname: () => '/fantasy-football',
}));

describe('SubNavigation Component', () => {
  const mockItems = [
    { label: 'Overview', href: '/fantasy-football', icon: '📊' },
    { label: 'Squad', href: '/fantasy-football/squad', icon: '⚽' },
    { label: 'Analytics', href: '/fantasy-football/analytics', icon: '📈' },
  ];

  it('should render with sticky positioning', () => {
    const { container } = render(
      <SubNavigation type="fpl" items={mockItems} />
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('sticky');
    expect(nav).toHaveClass('top-16');
  });

  it('should highlight active item with FPL colors', () => {
    jest.spyOn(require('next/navigation'), 'usePathname').mockReturnValue('/fantasy-football/squad');

    const { container } = render(
      <SubNavigation type="fpl" items={mockItems} />
    );

    const activeLink = container.querySelector('a[href="/fantasy-football/squad"]');
    expect(activeLink).toHaveClass('bg-[var(--fpl-primary)]/20');
    expect(activeLink).toHaveClass('text-[var(--fpl-primary)]');
    expect(activeLink).toHaveClass('border-[var(--fpl-primary)]');
  });

  it('should highlight active item with team colors', () => {
    jest.spyOn(require('next/navigation'), 'usePathname').mockReturnValue('/my-team/fixtures');

    const teamItems = [
      { label: 'Fixtures', href: '/my-team/fixtures', icon: '📅' },
    ];

    const { container } = render(
      <SubNavigation type="team" items={teamItems} />
    );

    const activeLink = container.querySelector('a[href="/my-team/fixtures"]');
    expect(activeLink).toHaveClass('bg-[var(--team-primary)]/20');
    expect(activeLink).toHaveClass('text-[var(--team-primary)]');
    expect(activeLink).toHaveClass('border-[var(--team-primary)]');
  });

  it('should render all navigation items', () => {
    render(<SubNavigation type="fpl" items={mockItems} />);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Squad')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    const { container } = render(
      <SubNavigation type="fpl" items={mockItems} />
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveAttribute('role', 'navigation');
    expect(nav).toHaveAttribute('aria-label', 'Fantasy Football sub-navigation');
  });

  it('should have team-specific aria-label', () => {
    const { container } = render(
      <SubNavigation type="team" items={mockItems} />
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveAttribute('aria-label', 'My Team sub-navigation');
  });

  it('should have horizontal scroll for overflow', () => {
    const { container } = render(
      <SubNavigation type="fpl" items={mockItems} />
    );

    const scrollContainer = container.querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();
  });

  it('should mark active item with aria-current', () => {
    jest.spyOn(require('next/navigation'), 'usePathname').mockReturnValue('/fantasy-football/squad');

    render(<SubNavigation type="fpl" items={mockItems} />);

    const activeLink = screen.getByText('Squad').closest('a');
    expect(activeLink).toHaveAttribute('aria-current', 'page');
  });
});





