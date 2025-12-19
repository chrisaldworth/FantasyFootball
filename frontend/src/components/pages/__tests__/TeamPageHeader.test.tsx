/**
 * Tests for TeamPageHeader Component
 * 
 * Tests the TeamPageHeader component to ensure:
 * - Team colors are used
 * - Title and subtitle display correctly
 * - Team logo displays correctly
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamPageHeader from '../TeamPageHeader';

describe('TeamPageHeader Component', () => {
  it('should render with team colors', () => {
    const { container } = render(
      <TeamPageHeader
        title="My Team"
        teamName="Arsenal"
        teamLogo="/arsenal-logo.png"
      />
    );

    const header = container.firstChild;
    expect(header).toHaveClass('bg-[var(--team-primary)]/10');
    expect(header).toHaveClass('border-[var(--team-primary)]');
  });

  it('should display title', () => {
    render(
      <TeamPageHeader
        title="My Team"
        teamName="Arsenal"
      />
    );
    
    expect(screen.getByText('My Team')).toBeInTheDocument();
  });

  it('should display subtitle when provided', () => {
    render(
      <TeamPageHeader
        title="My Team"
        teamName="Arsenal"
        subtitle="Follow your favorite club"
      />
    );

    expect(screen.getByText('Follow your favorite club')).toBeInTheDocument();
  });

  it('should not display subtitle when not provided', () => {
    const { container } = render(
      <TeamPageHeader
        title="My Team"
        teamName="Arsenal"
      />
    );

    const subtitle = container.querySelector('p');
    expect(subtitle).not.toBeInTheDocument();
  });

  it('should display team logo when provided', () => {
    render(
      <TeamPageHeader
        title="My Team"
        teamName="Arsenal"
        teamLogo="/arsenal-logo.png"
      />
    );

    const logo = screen.getByAltText('Arsenal');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/arsenal-logo.png');
  });

  it('should display default icon when no logo', () => {
    render(
      <TeamPageHeader
        title="My Team"
        teamName="Arsenal"
      />
    );

    const icon = screen.getByText('🏆');
    expect(icon).toBeInTheDocument();
  });

  it('should have proper responsive text sizing', () => {
    const { container } = render(
      <TeamPageHeader
        title="My Team"
        teamName="Arsenal"
      />
    );

    const title = container.querySelector('h1');
    expect(title).toHaveClass('text-2xl');
    expect(title).toHaveClass('sm:text-3xl');
  });
});


