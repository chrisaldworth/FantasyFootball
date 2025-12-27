/**
 * Tests for FPLPageHeader Component
 * 
 * Tests the FPLPageHeader component to ensure:
 * - FPL colors are used
 * - Title and subtitle display correctly
 * - Icon displays correctly
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FPLPageHeader from '../FPLPageHeader';

describe('FPLPageHeader Component', () => {
  it('should render with FPL colors', () => {
    const { container } = render(
      <FPLPageHeader title="Fantasy Football" />
    );

    const header = container.firstChild;
    expect(header).toHaveClass('bg-[var(--fpl-bg-tint)]');
    expect(header).toHaveClass('border-[var(--fpl-primary)]');
  });

  it('should display title', () => {
    render(<FPLPageHeader title="Fantasy Football" />);
    
    expect(screen.getByText('Fantasy Football')).toBeInTheDocument();
  });

  it('should display subtitle when provided', () => {
    render(
      <FPLPageHeader
        title="Fantasy Football"
        subtitle="Manage your fantasy squad"
      />
    );

    expect(screen.getByText('Manage your fantasy squad')).toBeInTheDocument();
  });

  it('should not display subtitle when not provided', () => {
    const { container } = render(
      <FPLPageHeader title="Fantasy Football" />
    );

    const subtitle = container.querySelector('p');
    expect(subtitle).not.toBeInTheDocument();
  });

  it('should display FPL icon', () => {
    render(<FPLPageHeader title="Fantasy Football" />);
    
    const icon = screen.getByText('⚽');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('should have proper responsive text sizing', () => {
    const { container } = render(
      <FPLPageHeader title="Fantasy Football" />
    );

    const title = container.querySelector('h1');
    expect(title).toHaveClass('text-2xl');
    expect(title).toHaveClass('sm:text-3xl');
  });

  it('should have proper responsive icon sizing', () => {
    render(<FPLPageHeader title="Fantasy Football" />);
    
    const icon = screen.getByText('⚽');
    expect(icon).toHaveClass('text-5xl');
    expect(icon).toHaveClass('sm:text-6xl');
  });
});




