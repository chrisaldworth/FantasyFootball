import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AlertCard from '../AlertCard';

describe('AlertCard', () => {
  const defaultProps = {
    priority: 'high' as const,
    icon: '⚠️',
    title: 'Test Alert',
    message: 'This is a test alert message',
  };

  it('renders with required props', () => {
    render(<AlertCard {...defaultProps} />);
    
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
    expect(screen.getByText('This is a test alert message')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders icon with aria-hidden', () => {
    render(<AlertCard {...defaultProps} />);
    
    const icon = screen.getByText('⚠️');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies high priority styling', () => {
    const { container } = render(<AlertCard {...defaultProps} priority="high" />);
    
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-[var(--pl-pink)]');
    expect(card.className).toContain('bg-[var(--pl-pink)]/10');
  });

  it('applies medium priority styling', () => {
    const { container } = render(<AlertCard {...defaultProps} priority="medium" />);
    
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-[var(--pl-yellow)]');
    expect(card.className).toContain('bg-[var(--pl-yellow)]/10');
  });

  it('applies low priority styling', () => {
    const { container } = render(<AlertCard {...defaultProps} priority="low" />);
    
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-[var(--pl-cyan)]');
    expect(card.className).toContain('bg-[var(--pl-cyan)]/10');
  });

  it('renders action link when actionHref is provided', () => {
    render(
      <AlertCard
        {...defaultProps}
        actionLabel="View Details"
        actionHref="/details"
      />
    );
    
    const link = screen.getByText('View Details').closest('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/details');
  });

  it('renders action button when onAction is provided without actionHref', async () => {
    const handleAction = jest.fn();
    render(
      <AlertCard
        {...defaultProps}
        actionLabel="Take Action"
        onAction={handleAction}
      />
    );
    
    const button = screen.getByText('Take Action').closest('button');
    expect(button).toBeInTheDocument();
    
    await userEvent.click(button!);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action when neither actionHref nor onAction provided', () => {
    render(<AlertCard {...defaultProps} actionLabel="Action" />);
    
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
  });

  it('renders arrow icon in action link', () => {
    render(
      <AlertCard
        {...defaultProps}
        actionLabel="View Details"
        actionHref="/details"
      />
    );
    
    const arrow = screen.getByText('→');
    expect(arrow).toBeInTheDocument();
    expect(arrow).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders arrow icon in action button', () => {
    render(
      <AlertCard
        {...defaultProps}
        actionLabel="Take Action"
        onAction={() => {}}
      />
    );
    
    const arrow = screen.getByText('→');
    expect(arrow).toBeInTheDocument();
    expect(arrow).toHaveAttribute('aria-hidden', 'true');
  });

  it('prioritizes actionHref over onAction when both provided', () => {
    const handleAction = jest.fn();
    render(
      <AlertCard
        {...defaultProps}
        actionLabel="Action"
        actionHref="/details"
        onAction={handleAction}
      />
    );
    
    const link = screen.getByText('Action').closest('a');
    expect(link).toBeInTheDocument();
    expect(screen.queryByText('Action')?.closest('button')).not.toBeInTheDocument();
  });
});

