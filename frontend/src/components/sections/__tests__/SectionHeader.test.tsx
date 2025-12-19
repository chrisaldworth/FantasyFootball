/**
 * Tests for SectionHeader Component
 * 
 * Tests the SectionHeader component to ensure:
 * - FPL headers use FPL colors
 * - Team headers use team colors
 * - Icons display correctly
 * - Team logos display correctly
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SectionHeader from '../SectionHeader';

describe('SectionHeader Component', () => {
  it('should render FPL header with FPL colors', () => {
    const { container } = render(
      <SectionHeader type="fpl" title="FANTASY FOOTBALL" />
    );

    const header = container.firstChild;
    expect(header).toHaveClass('border-[var(--fpl-primary)]');
    expect(header).toHaveClass('bg-[var(--fpl-bg-tint)]');
    expect(header).toHaveClass('text-[var(--fpl-primary)]');
  });

  it('should render team header with team colors', () => {
    const { container } = render(
      <SectionHeader type="team" title="MY TEAM" />
    );

    const header = container.firstChild;
    expect(header).toHaveClass('border-[var(--team-primary)]');
    expect(header).toHaveClass('bg-[var(--team-primary)]/10');
    expect(header).toHaveClass('text-[var(--team-primary)]');
  });

  it('should display default FPL icon when no icon provided', () => {
    render(<SectionHeader type="fpl" title="FPL Section" />);
    
    const icon = screen.getByText('⚽');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('should display default team icon when no icon or logo provided', () => {
    render(<SectionHeader type="team" title="Team Section" />);
    
    const icon = screen.getByText('🏆');
    expect(icon).toBeInTheDocument();
  });

  it('should display custom icon when provided', () => {
    render(<SectionHeader type="fpl" title="Test" icon="🎮" />);
    
    const icon = screen.getByText('🎮');
    expect(icon).toBeInTheDocument();
  });

  it('should display team logo when provided', () => {
    render(
      <SectionHeader
        type="team"
        title="Arsenal"
        teamLogo="/arsenal-logo.png"
        teamName="Arsenal"
      />
    );

    const logo = screen.getByAltText('Arsenal');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/arsenal-logo.png');
  });

  it('should prioritize team logo over icon', () => {
    const { container } = render(
      <SectionHeader
        type="team"
        title="Arsenal"
        icon="🏆"
        teamLogo="/arsenal-logo.png"
        teamName="Arsenal"
      />
    );

    // Logo should be shown, icon should not
    expect(screen.getByAltText('Arsenal')).toBeInTheDocument();
    expect(screen.queryByText('🏆')).not.toBeInTheDocument();
  });

  it('should display title', () => {
    render(<SectionHeader type="fpl" title="FANTASY FOOTBALL" />);
    
    expect(screen.getByText('FANTASY FOOTBALL')).toBeInTheDocument();
  });

  it('should display subtitle when provided', () => {
    render(
      <SectionHeader
        type="fpl"
        title="FPL Section"
        subtitle="Your fantasy team"
      />
    );

    expect(screen.getByText('Your fantasy team')).toBeInTheDocument();
  });

  it('should not display subtitle when not provided', () => {
    const { container } = render(
      <SectionHeader type="fpl" title="FPL Section" />
    );

    const subtitle = container.querySelector('p');
    expect(subtitle).not.toBeInTheDocument();
  });

  it('should have proper responsive text sizing', () => {
    const { container } = render(
      <SectionHeader type="fpl" title="Test" />
    );

    const title = container.querySelector('h2');
    expect(title).toHaveClass('text-xl');
    expect(title).toHaveClass('sm:text-2xl');
  });

  it('should have proper responsive icon sizing', () => {
    render(<SectionHeader type="fpl" title="Test" />);
    
    const icon = screen.getByText('⚽');
    expect(icon).toHaveClass('text-3xl');
    expect(icon).toHaveClass('sm:text-4xl');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SectionHeader type="fpl" title="Test" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

