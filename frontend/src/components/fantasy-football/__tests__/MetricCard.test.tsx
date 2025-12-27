import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MetricCard from '../MetricCard';

describe('MetricCard', () => {
  it('renders with required props', () => {
    render(<MetricCard title="Test Metric" value="100" />);
    
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<MetricCard title="Test" value="100" icon="📊" />);
    
    const icon = screen.getByText('📊');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders subtitle when provided', () => {
    render(<MetricCard title="Test" value="100" subtitle="Subtitle text" />);
    
    expect(screen.getByText('Subtitle text')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<MetricCard title="Test" value="100" />);
    
    expect(screen.queryByText('Subtitle text')).not.toBeInTheDocument();
  });

  it('renders change indicator with up direction', () => {
    render(
      <MetricCard
        title="Test"
        value="100"
        change={{ value: 5, direction: 'up' }}
      />
    );
    
    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders change indicator with down direction', () => {
    render(
      <MetricCard
        title="Test"
        value="100"
        change={{ value: 3, direction: 'down' }}
      />
    );
    
    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders change indicator with neutral direction', () => {
    render(
      <MetricCard
        title="Test"
        value="100"
        change={{ value: 0, direction: 'neutral' }}
      />
    );
    
    expect(screen.getByText('→')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('formats change value with locale string', () => {
    render(
      <MetricCard
        title="Test"
        value="100"
        change={{ value: 1000, direction: 'up' }}
      />
    );
    
    expect(screen.getByText('1,000')).toBeInTheDocument();
  });

  it('renders live status badge', () => {
    render(<MetricCard title="Test" value="100" status="live" />);
    
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('renders finished status badge', () => {
    render(<MetricCard title="Test" value="100" status="finished" />);
    
    expect(screen.getByText('FINISHED')).toBeInTheDocument();
  });

  it('renders upcoming status badge', () => {
    render(<MetricCard title="Test" value="100" status="upcoming" />);
    
    expect(screen.getByText('UPCOMING')).toBeInTheDocument();
  });

  it('does not render status badge when not provided', () => {
    render(<MetricCard title="Test" value="100" />);
    
    expect(screen.queryByText('LIVE')).not.toBeInTheDocument();
    expect(screen.queryByText('FINISHED')).not.toBeInTheDocument();
    expect(screen.queryByText('UPCOMING')).not.toBeInTheDocument();
  });

  it('uses FPL color theme by default', () => {
    const { container } = render(<MetricCard title="Test" value="100" />);
    
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-[var(--fpl-primary)]');
    expect(card.className).toContain('bg-[var(--fpl-primary)]/10');
  });

  it('uses FPL color theme when explicitly set', () => {
    const { container } = render(<MetricCard title="Test" value="100" color="fpl" />);
    
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-[var(--fpl-primary)]');
    expect(card.className).toContain('bg-[var(--fpl-primary)]/10');
  });

  it('uses team color theme when set', () => {
    const { container } = render(<MetricCard title="Test" value="100" color="team" />);
    
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-[var(--team-primary)]');
    expect(card.className).toContain('bg-[var(--team-primary)]/10');
  });

  it('renders numeric value correctly', () => {
    render(<MetricCard title="Test" value={12345} />);
    
    expect(screen.getByText('12345')).toBeInTheDocument();
  });

  it('renders string value correctly', () => {
    render(<MetricCard title="Test" value="#1,234" />);
    
    expect(screen.getByText('#1,234')).toBeInTheDocument();
  });

  it('applies correct text color for FPL theme', () => {
    const { container } = render(<MetricCard title="Test" value="100" color="fpl" />);
    
    const valueElement = container.querySelector('.text-3xl');
    expect(valueElement?.className).toContain('text-[var(--fpl-primary)]');
  });

  it('applies correct text color for team theme', () => {
    const { container } = render(<MetricCard title="Test" value="100" color="team" />);
    
    const valueElement = container.querySelector('.text-3xl');
    expect(valueElement?.className).toContain('text-[var(--team-primary)]');
  });

  it('applies correct change color for up direction', () => {
    const { container } = render(
      <MetricCard
        title="Test"
        value="100"
        change={{ value: 5, direction: 'up' }}
      />
    );
    
    const changeElement = container.querySelector('.text-sm.font-medium');
    expect(changeElement?.className).toContain('text-[var(--pl-green)]');
  });

  it('applies correct change color for down direction', () => {
    const { container } = render(
      <MetricCard
        title="Test"
        value="100"
        change={{ value: 5, direction: 'down' }}
      />
    );
    
    const changeElement = container.querySelector('.text-sm.font-medium');
    expect(changeElement?.className).toContain('text-[var(--pl-pink)]');
  });

  it('applies correct change color for neutral direction', () => {
    const { container } = render(
      <MetricCard
        title="Test"
        value="100"
        change={{ value: 0, direction: 'neutral' }}
      />
    );
    
    const changeElement = container.querySelector('.text-sm.font-medium');
    expect(changeElement?.className).toContain('text-[var(--pl-text-muted)]');
  });
});



