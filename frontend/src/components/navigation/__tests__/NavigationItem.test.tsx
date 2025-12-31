/**
 * Tests for NavigationItem Component - Color Differentiation
 * 
 * Tests the NavigationItem component to ensure:
 * - FPL items use FPL colors when active
 * - Team items use team colors when active
 * - Neutral items use default colors
 * - Color differentiation works correctly
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavigationItem from '../NavigationItem';

// Mock usePathname
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('NavigationItem Component - Color Differentiation', () => {
  it('should use FPL colors when active and color is fpl', () => {
    const { container } = render(
      <NavigationItem
        icon="⚽"
        label="FPL Squad"
        href="/dashboard"
        color="fpl"
      />
    );

    const link = container.querySelector('a');
    expect(link).toHaveClass('bg-[var(--fpl-primary)]/20');
    expect(link).toHaveClass('text-[var(--fpl-primary)]');
    expect(link).toHaveClass('border');
    expect(link).toHaveClass('border-[var(--fpl-primary)]/30');
  });

  it('should use team colors when active and color is team', () => {
    const { container } = render(
      <NavigationItem
        icon="🏆"
        label="My Team"
        href="/dashboard"
        color="team"
      />
    );

    const link = container.querySelector('a');
    expect(link).toHaveClass('bg-[var(--team-primary)]/20');
    expect(link).toHaveClass('text-[var(--team-primary)]');
    expect(link).toHaveClass('border');
    expect(link).toHaveClass('border-[var(--team-primary)]/30');
  });

  it('should use default colors when active and color is neutral', () => {
    const { container } = render(
      <NavigationItem
        icon="🏠"
        label="Dashboard"
        href="/dashboard"
        color="neutral"
      />
    );

    const link = container.querySelector('a');
    expect(link).toHaveClass('bg-[var(--team-primary)]');
    expect(link).toHaveClass('text-[var(--team-text-on-primary)]');
  });

  it('should not use FPL colors for team items', () => {
    const { container } = render(
      <NavigationItem
        icon="🏆"
        label="My Team"
        href="/dashboard"
        color="team"
      />
    );

    const link = container.querySelector('a');
    expect(link).not.toHaveClass('bg-[var(--fpl-primary)]/20');
    expect(link).not.toHaveClass('text-[var(--fpl-primary)]');
  });

  it('should not use team colors for FPL items', () => {
    const { container } = render(
      <NavigationItem
        icon="⚽"
        label="FPL Squad"
        href="/other-page"
        color="fpl"
        isActive={true}
      />
    );

    const link = container.querySelector('a');
    expect(link).not.toHaveClass('bg-[var(--team-primary)]');
    expect(link).not.toHaveClass('text-[var(--team-text-on-primary)]');
  });

  it('should use muted colors when inactive', () => {
    const { container } = render(
      <NavigationItem
        icon="⚽"
        label="FPL Squad"
        href="/other-page"
        color="fpl"
      />
    );

    const link = container.querySelector('a');
    expect(link).toHaveClass('text-[var(--pl-text-muted)]');
    expect(link).toHaveClass('hover:text-white');
    expect(link).toHaveClass('hover:bg-white/5');
  });

  it('should render icon and label', () => {
    render(
      <NavigationItem
        icon="⚽"
        label="FPL Squad"
        href="/dashboard"
        color="fpl"
      />
    );

    expect(screen.getByText('⚽')).toBeInTheDocument();
    expect(screen.getByText('FPL Squad')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <NavigationItem
        icon="⚽"
        label="FPL Squad"
        href="/dashboard"
        color="fpl"
      />
    );

    const link = screen.getByLabelText('FPL Squad');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('should handle collapsed sidebar state', () => {
    const { container } = render(
      <NavigationItem
        icon="⚽"
        label="FPL Squad"
        href="/dashboard"
        color="fpl"
        className="justify-center"
      />
    );

    const link = container.querySelector('a');
    expect(link).toHaveClass('flex-col');
    expect(link).toHaveClass('justify-center');
  });

  it('should handle expanded sidebar state', () => {
    const { container } = render(
      <NavigationItem
        icon="⚽"
        label="FPL Squad"
        href="/dashboard"
        color="fpl"
        className="flex-row"
      />
    );

    const link = container.querySelector('a');
    expect(link).toHaveClass('flex-row');
    expect(link).toHaveClass('justify-start');
  });
});





