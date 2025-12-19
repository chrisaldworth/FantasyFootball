/**
 * Tests for HeroSection Component
 * 
 * Tests the HeroSection component to ensure:
 * - Renders correctly with different props
 * - Conditional rendering works
 * - Responsive layouts work
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeroSection from '../HeroSection';

// Mock the child components
jest.mock('@/components/LiveRank', () => {
  return function MockLiveRank({ teamId, currentGameweek, isLive }: any) {
    return <div data-testid="live-rank">LiveRank: {teamId}, GW: {currentGameweek}, Live: {isLive}</div>;
  };
});

jest.mock('../CountdownTimer', () => {
  return function MockCountdownTimer({ targetDate, label }: any) {
    return <div data-testid="countdown-timer">Countdown: {label} - {targetDate}</div>;
  };
});

jest.mock('../KeyAlerts', () => {
  return function MockKeyAlerts({ alerts }: any) {
    return <div data-testid="key-alerts">Alerts: {alerts?.length || 0}</div>;
  };
});

describe('HeroSection Component', () => {
  const defaultProps = {
    teamId: 123,
    currentGameweek: 10,
    isLive: true,
  };

  it('should render the section heading', () => {
    render(<HeroSection {...defaultProps} />);
    expect(screen.getByText("What's Important Right Now")).toBeInTheDocument();
  });

  it('should render LiveRank when isLive is true', () => {
    render(<HeroSection {...defaultProps} isLive={true} />);
    expect(screen.getByTestId('live-rank')).toBeInTheDocument();
  });

  it('should not render LiveRank when isLive is false', () => {
    render(<HeroSection {...defaultProps} isLive={false} />);
    expect(screen.queryByTestId('live-rank')).not.toBeInTheDocument();
  });

  it('should render CountdownTimer when nextFixtureDate is provided', () => {
    const nextFixtureDate = '2024-01-15T15:00:00Z';
    render(<HeroSection {...defaultProps} nextFixtureDate={nextFixtureDate} nextFixtureLabel="Next Match" />);
    expect(screen.getByTestId('countdown-timer')).toBeInTheDocument();
  });

  it('should not render CountdownTimer when nextFixtureDate is not provided', () => {
    render(<HeroSection {...defaultProps} />);
    expect(screen.queryByTestId('countdown-timer')).not.toBeInTheDocument();
  });

  it('should render KeyAlerts when alerts are provided', () => {
    const alerts = [
      { id: '1', type: 'injury' as const, message: 'Test alert', priority: 'high' as const },
    ];
    render(<HeroSection {...defaultProps} alerts={alerts} />);
    expect(screen.getByTestId('key-alerts')).toBeInTheDocument();
  });

  it('should not render KeyAlerts when alerts array is empty', () => {
    render(<HeroSection {...defaultProps} alerts={[]} />);
    expect(screen.queryByTestId('key-alerts')).not.toBeInTheDocument();
  });

  it('should render mobile layout by default', () => {
    const { container } = render(<HeroSection {...defaultProps} />);
    // Mobile layout uses lg:hidden class
    const mobileSection = container.querySelector('.lg\\:hidden');
    expect(mobileSection).toBeInTheDocument();
  });

  it('should render desktop layout with 2-column grid', () => {
    const { container } = render(<HeroSection {...defaultProps} />);
    // Desktop layout uses hidden lg:grid lg:grid-cols-2
    const desktopSection = container.querySelector('.hidden.lg\\:grid');
    expect(desktopSection).toBeInTheDocument();
  });

  it('should handle null currentGameweek', () => {
    render(<HeroSection {...defaultProps} currentGameweek={null} />);
    expect(screen.queryByTestId('live-rank')).not.toBeInTheDocument();
  });
});


