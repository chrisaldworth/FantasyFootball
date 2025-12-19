/**
 * Tests for DashboardSection Component
 * 
 * Tests the DashboardSection component to ensure:
 * - FPL sections use FPL colors
 * - Team sections use team colors
 * - View All button works
 * - Preview content displays
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardSection from '../DashboardSection';

// Mock SectionHeader
jest.mock('../../sections/SectionHeader', () => {
  return function MockSectionHeader({ type, title }: any) {
    return <div data-testid="section-header" data-type={type}>{title}</div>;
  };
});

describe('DashboardSection Component', () => {
  it('should render FPL section with FPL colors', () => {
    const { container } = render(
      <DashboardSection
        type="fpl"
        title="Fantasy Football"
        viewAllHref="/fantasy-football"
      >
        <div>Preview Content</div>
      </DashboardSection>
    );

    const section = container.firstChild;
    expect(section).toHaveClass('border-[var(--fpl-primary)]');
    expect(section).toHaveClass('bg-[var(--fpl-bg-tint)]');
  });

  it('should render team section with team colors', () => {
    const { container } = render(
      <DashboardSection
        type="team"
        title="My Team"
        viewAllHref="/my-team"
      >
        <div>Preview Content</div>
      </DashboardSection>
    );

    const section = container.firstChild;
    expect(section).toHaveClass('border-[var(--team-primary)]');
    expect(section).toHaveClass('bg-[var(--team-primary)]/10');
  });

  it('should display View All button with correct href', () => {
    render(
      <DashboardSection
        type="fpl"
        title="Fantasy Football"
        viewAllHref="/fantasy-football"
      >
        <div>Content</div>
      </DashboardSection>
    );

    const viewAllLink = screen.getByText(/View All/i);
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink.closest('a')).toHaveAttribute('href', '/fantasy-football');
  });

  it('should display View All button with FPL colors for FPL section', () => {
    const { container } = render(
      <DashboardSection
        type="fpl"
        title="Fantasy Football"
        viewAllHref="/fantasy-football"
      >
        <div>Content</div>
      </DashboardSection>
    );

    const viewAllLink = container.querySelector('a');
    expect(viewAllLink).toHaveClass('border-[var(--fpl-primary)]');
    expect(viewAllLink).toHaveClass('text-[var(--fpl-primary)]');
  });

  it('should display View All button with team colors for team section', () => {
    const { container } = render(
      <DashboardSection
        type="team"
        title="My Team"
        viewAllHref="/my-team"
      >
        <div>Content</div>
      </DashboardSection>
    );

    const viewAllLink = container.querySelector('a');
    expect(viewAllLink).toHaveClass('border-[var(--team-primary)]');
    expect(viewAllLink).toHaveClass('text-[var(--team-primary)]');
  });

  it('should render children content', () => {
    render(
      <DashboardSection
        type="fpl"
        title="Test"
        viewAllHref="/test"
      >
        <div data-testid="preview-content">Preview Content</div>
      </DashboardSection>
    );

    expect(screen.getByTestId('preview-content')).toBeInTheDocument();
  });

  it('should pass props to SectionHeader', () => {
    render(
      <DashboardSection
        type="team"
        title="My Team"
        subtitle="Follow your favorite club"
        icon="🏆"
        teamLogo="/logo.png"
        teamName="Arsenal"
        viewAllHref="/my-team"
      >
        <div>Content</div>
      </DashboardSection>
    );

    const header = screen.getByTestId('section-header');
    expect(header).toHaveAttribute('data-type', 'team');
  });

  it('should include title in View All button text', () => {
    render(
      <DashboardSection
        type="fpl"
        title="Fantasy Football"
        viewAllHref="/fantasy-football"
      >
        <div>Content</div>
      </DashboardSection>
    );

    expect(screen.getByText('View All Fantasy Football')).toBeInTheDocument();
  });
});


