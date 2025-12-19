import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuickActionButton from '../QuickActionButton';

describe('QuickActionButton', () => {
  const defaultProps = {
    icon: '🔄',
    label: 'Make Transfers',
    href: '/transfers',
  };

  it('renders with required props', () => {
    render(<QuickActionButton {...defaultProps} />);
    
    expect(screen.getByText('🔄')).toBeInTheDocument();
    expect(screen.getByText('Make Transfers')).toBeInTheDocument();
  });

  it('renders as a link with correct href', () => {
    render(<QuickActionButton {...defaultProps} />);
    
    const link = screen.getByText('Make Transfers').closest('a');
    expect(link).toHaveAttribute('href', '/transfers');
  });

  it('renders icon with aria-hidden', () => {
    render(<QuickActionButton {...defaultProps} />);
    
    const icon = screen.getByText('🔄');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies outlined variant by default', () => {
    const { container } = render(<QuickActionButton {...defaultProps} />);
    
    const link = container.querySelector('a');
    expect(link?.className).toContain('border-2');
    expect(link?.className).toContain('border-[var(--fpl-primary)]');
    expect(link?.className).toContain('text-[var(--fpl-primary)]');
  });

  it('applies outlined variant when explicitly set', () => {
    const { container } = render(
      <QuickActionButton {...defaultProps} variant="outlined" />
    );
    
    const link = container.querySelector('a');
    expect(link?.className).toContain('border-2');
    expect(link?.className).toContain('border-[var(--fpl-primary)]');
  });

  it('applies primary variant styling', () => {
    const { container } = render(
      <QuickActionButton {...defaultProps} variant="primary" />
    );
    
    const link = container.querySelector('a');
    expect(link?.className).toContain('bg-[var(--fpl-primary)]');
    expect(link?.className).toContain('text-[var(--fpl-text-on-primary)]');
    expect(link?.className).not.toContain('border-2');
  });

  it('renders badge when provided', () => {
    render(<QuickActionButton {...defaultProps} badge={true} />);
    
    const badge = screen.getByLabelText('Action required');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-[var(--pl-pink)]');
  });

  it('does not render badge when not provided', () => {
    render(<QuickActionButton {...defaultProps} />);
    
    expect(screen.queryByLabelText('Action required')).not.toBeInTheDocument();
  });

  it('does not render badge when false', () => {
    render(<QuickActionButton {...defaultProps} badge={false} />);
    
    expect(screen.queryByLabelText('Action required')).not.toBeInTheDocument();
  });

  it('positions badge in top right corner', () => {
    const { container } = render(
      <QuickActionButton {...defaultProps} badge={true} />
    );
    
    const badge = screen.getByLabelText('Action required');
    expect(badge.className).toContain('absolute');
    expect(badge.className).toContain('top-2');
    expect(badge.className).toContain('right-2');
  });

  it('applies full width styling', () => {
    const { container } = render(<QuickActionButton {...defaultProps} />);
    
    const link = container.querySelector('a');
    expect(link?.className).toContain('w-full');
  });

  it('applies correct height', () => {
    const { container } = render(<QuickActionButton {...defaultProps} />);
    
    const link = container.querySelector('a');
    expect(link?.className).toContain('h-14');
  });

  it('applies flex column layout', () => {
    const { container } = render(<QuickActionButton {...defaultProps} />);
    
    const link = container.querySelector('a');
    expect(link?.className).toContain('flex-col');
  });

  it('applies transition classes', () => {
    const { container } = render(<QuickActionButton {...defaultProps} />);
    
    const link = container.querySelector('a');
    expect(link?.className).toContain('transition-all');
  });

  it('applies hover effect for outlined variant', () => {
    const { container } = render(<QuickActionButton {...defaultProps} />);
    
    const link = container.querySelector('a');
    expect(link?.className).toContain('hover:bg-[var(--fpl-primary)]/10');
  });

  it('applies hover effect for primary variant', () => {
    const { container } = render(
      <QuickActionButton {...defaultProps} variant="primary" />
    );
    
    const link = container.querySelector('a');
    expect(link?.className).toContain('hover:opacity-90');
  });
});

