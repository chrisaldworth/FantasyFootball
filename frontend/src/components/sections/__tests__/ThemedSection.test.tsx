/**
 * Tests for ThemedSection Component
 * 
 * Tests the ThemedSection component to ensure:
 * - FPL sections use FPL colors
 * - Team sections use team colors
 * - No color mixing
 * - Proper rendering
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemedSection from '../ThemedSection';

// Mock SectionHeader
jest.mock('../SectionHeader', () => {
  return function MockSectionHeader({ type, title }: any) {
    return <div data-testid="section-header" data-type={type}>{title}</div>;
  };
});

describe('ThemedSection Component', () => {
  it('should render FPL section with FPL colors', () => {
    const { container } = render(
      <ThemedSection type="fpl" title="FPL Section">
        <div>Content</div>
      </ThemedSection>
    );

    const section = container.firstChild;
    expect(section).toHaveClass('border-[var(--fpl-primary)]');
    expect(section).toHaveClass('bg-[var(--fpl-bg-tint)]');
  });

  it('should render team section with team colors', () => {
    const { container } = render(
      <ThemedSection type="team" title="Team Section">
        <div>Content</div>
      </ThemedSection>
    );

    const section = container.firstChild;
    expect(section).toHaveClass('border-[var(--team-primary)]');
    expect(section).toHaveClass('bg-[var(--team-primary)]/10');
  });

  it('should not mix FPL and team colors', () => {
    const { container: fplContainer } = render(
      <ThemedSection type="fpl" title="FPL">
        <div>Content</div>
      </ThemedSection>
    );

    const { container: teamContainer } = render(
      <ThemedSection type="team" title="Team">
        <div>Content</div>
      </ThemedSection>
    );

    const fplSection = fplContainer.firstChild;
    const teamSection = teamContainer.firstChild;

    // FPL should NOT have team colors
    expect(fplSection).not.toHaveClass('border-[var(--team-primary)]');
    expect(fplSection).not.toHaveClass('bg-[var(--team-primary)]/10');

    // Team should NOT have FPL colors
    expect(teamSection).not.toHaveClass('border-[var(--fpl-primary)]');
    expect(teamSection).not.toHaveClass('bg-[var(--fpl-bg-tint)]');
  });

  it('should pass type to SectionHeader', () => {
    render(
      <ThemedSection type="fpl" title="FPL Section">
        <div>Content</div>
      </ThemedSection>
    );

    const header = screen.getByTestId('section-header');
    expect(header).toHaveAttribute('data-type', 'fpl');
  });

  it('should render children content', () => {
    render(
      <ThemedSection type="fpl" title="Test">
        <div data-testid="content">Test Content</div>
      </ThemedSection>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ThemedSection type="fpl" title="Test" className="custom-class">
        <div>Content</div>
      </ThemedSection>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should pass all props to SectionHeader', () => {
    render(
      <ThemedSection
        type="team"
        title="Team Section"
        subtitle="Subtitle"
        icon="🏆"
        teamLogo="/logo.png"
        teamName="Arsenal"
      >
        <div>Content</div>
      </ThemedSection>
    );

    const header = screen.getByTestId('section-header');
    expect(header).toHaveAttribute('data-type', 'team');
  });

  it('should have proper responsive padding', () => {
    const { container } = render(
      <ThemedSection type="fpl" title="Test">
        <div>Content</div>
      </ThemedSection>
    );

    const contentDiv = container.querySelector('.p-4.sm\\:p-6');
    expect(contentDiv).toBeInTheDocument();
  });
});

