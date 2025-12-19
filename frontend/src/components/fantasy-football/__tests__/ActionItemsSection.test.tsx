import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ActionItemsSection, { AlertCardProps } from '../ActionItemsSection';

describe('ActionItemsSection', () => {
  const mockAlerts: AlertCardProps[] = [
    {
      priority: 'high',
      icon: '🏥',
      title: 'Injured Players',
      message: 'Player 1 is injured',
      actionLabel: 'View Squad',
      actionHref: '/squad',
    },
    {
      priority: 'medium',
      icon: '⏰',
      title: 'Deadline Approaching',
      message: 'Deadline in 2 hours',
      actionLabel: 'Make Changes',
      actionHref: '/transfers',
    },
    {
      priority: 'low',
      icon: '📊',
      title: 'Weekly Report',
      message: 'Your weekly report is ready',
    },
  ];

  it('renders with title and icon', () => {
    render(<ActionItemsSection alerts={[]} />);
    
    expect(screen.getByText('Action Items & Alerts')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders alert count badge when alerts exist', () => {
    render(<ActionItemsSection alerts={mockAlerts} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not render alert count badge when no alerts', () => {
    render(<ActionItemsSection alerts={[]} />);
    
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('renders all alerts when expanded by default', () => {
    render(<ActionItemsSection alerts={mockAlerts} defaultExpanded={true} />);
    
    expect(screen.getByText('Injured Players')).toBeInTheDocument();
    expect(screen.getByText('Deadline Approaching')).toBeInTheDocument();
    expect(screen.getByText('Weekly Report')).toBeInTheDocument();
  });

  it('does not render alerts when collapsed', () => {
    render(<ActionItemsSection alerts={mockAlerts} defaultExpanded={false} />);
    
    expect(screen.queryByText('Injured Players')).not.toBeInTheDocument();
  });

  it('toggles expansion when button clicked', async () => {
    const user = userEvent.setup();
    render(<ActionItemsSection alerts={mockAlerts} defaultExpanded={true} />);
    
    expect(screen.getByText('Injured Players')).toBeInTheDocument();
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.queryByText('Injured Players')).not.toBeInTheDocument();
    
    await user.click(button);
    
    expect(screen.getByText('Injured Players')).toBeInTheDocument();
  });

  it('sorts alerts by priority (high, medium, low)', () => {
    render(<ActionItemsSection alerts={mockAlerts} defaultExpanded={true} />);
    
    const alerts = screen.getAllByRole('heading', { level: 3 });
    expect(alerts[0]).toHaveTextContent('Injured Players'); // high
    expect(alerts[1]).toHaveTextContent('Deadline Approaching'); // medium
    expect(alerts[2]).toHaveTextContent('Weekly Report'); // low
  });

  it('renders empty state when no alerts', () => {
    render(<ActionItemsSection alerts={[]} defaultExpanded={true} />);
    
    expect(screen.getByText('No action items at this time.')).toBeInTheDocument();
  });

  it('does not render empty state when collapsed', () => {
    render(<ActionItemsSection alerts={[]} defaultExpanded={false} />);
    
    expect(screen.queryByText('No action items at this time.')).not.toBeInTheDocument();
  });

  it('has proper ARIA attributes for collapsible section', () => {
    render(<ActionItemsSection alerts={mockAlerts} defaultExpanded={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-controls', 'action-items-content');
  });

  it('updates aria-expanded when toggled', async () => {
    const user = userEvent.setup();
    render(<ActionItemsSection alerts={mockAlerts} defaultExpanded={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders chevron icon with rotation when expanded', () => {
    const { container } = render(
      <ActionItemsSection alerts={mockAlerts} defaultExpanded={true} />
    );
    
    const svg = container.querySelector('svg');
    expect(svg?.className).toContain('rotate-180');
  });

  it('renders chevron icon without rotation when collapsed', () => {
    const { container } = render(
      <ActionItemsSection alerts={mockAlerts} defaultExpanded={false} />
    );
    
    const svg = container.querySelector('svg');
    expect(svg?.className).not.toContain('rotate-180');
  });

  it('renders content with correct id for aria-controls', () => {
    render(<ActionItemsSection alerts={mockAlerts} defaultExpanded={true} />);
    
    const content = document.getElementById('action-items-content');
    expect(content).toBeInTheDocument();
  });
});

