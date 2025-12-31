/**
 * Tests for ContentTypeBadge Component
 * 
 * Tests the ContentTypeBadge component to ensure:
 * - FPL badges use FPL colors
 * - Team badges use team colors
 * - Positioning works correctly
 * - Labels display correctly
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContentTypeBadge from '../ContentTypeBadge';

describe('ContentTypeBadge Component', () => {
  it('should render FPL badge with FPL colors', () => {
    const { container } = render(
      <ContentTypeBadge type="fpl" />
    );

    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-[var(--fpl-primary)]');
    expect(badge).toHaveClass('text-[var(--fpl-text-on-primary)]');
  });

  it('should render team badge with team colors', () => {
    const { container } = render(
      <ContentTypeBadge type="team" />
    );

    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-[var(--team-primary)]');
    expect(badge).toHaveClass('text-[var(--team-text-on-primary)]');
  });

  it('should display default FPL label', () => {
    render(<ContentTypeBadge type="fpl" />);
    
    expect(screen.getByText('FPL')).toBeInTheDocument();
  });

  it('should display custom label when provided', () => {
    render(<ContentTypeBadge type="fpl" label="FANTASY" />);
    
    expect(screen.getByText('FANTASY')).toBeInTheDocument();
  });

  it('should display team name when provided', () => {
    render(<ContentTypeBadge type="team" teamName="Arsenal" />);
    
    expect(screen.getByText('Arsenal')).toBeInTheDocument();
  });

  it('should display default team label when no team name', () => {
    render(<ContentTypeBadge type="team" />);
    
    expect(screen.getByText('TEAM')).toBeInTheDocument();
  });

  it('should display FPL icon', () => {
    render(<ContentTypeBadge type="fpl" />);
    
    const icon = screen.getByText('⚽');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('should display team icon when no logo', () => {
    render(<ContentTypeBadge type="team" />);
    
    const icon = screen.getByText('🏆');
    expect(icon).toBeInTheDocument();
  });

  it('should display team logo when provided', () => {
    render(
      <ContentTypeBadge
        type="team"
        teamLogo="/arsenal-logo.png"
        teamName="Arsenal"
      />
    );

    const logo = screen.getByAltText('Arsenal');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/arsenal-logo.png');
  });

  it('should position badge at top-right by default', () => {
    const { container } = render(<ContentTypeBadge type="fpl" />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('top-4');
    expect(badge).toHaveClass('right-4');
  });

  it('should position badge at top-left when specified', () => {
    const { container } = render(
      <ContentTypeBadge type="fpl" position="top-left" />
    );
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('top-4');
    expect(badge).toHaveClass('left-4');
  });

  it('should have proper accessibility attributes', () => {
    render(<ContentTypeBadge type="fpl" />);
    
    const badge = screen.getByLabelText('Fantasy Football content');
    expect(badge).toBeInTheDocument();
  });

  it('should have team-specific aria-label', () => {
    render(<ContentTypeBadge type="team" teamName="Arsenal" />);
    
    const badge = screen.getByLabelText('Arsenal content');
    expect(badge).toBeInTheDocument();
  });

  it('should be absolutely positioned', () => {
    const { container } = render(<ContentTypeBadge type="fpl" />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('absolute');
  });

  it('should have proper z-index', () => {
    const { container } = render(<ContentTypeBadge type="fpl" />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('z-10');
  });
});





