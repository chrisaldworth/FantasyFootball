/**
 * Tests for BottomNavigation Component - Color Coding
 * 
 * Tests the BottomNavigation component to ensure:
 * - FPL items use FPL color
 * - Team items use team color
 * - Neutral items use default color
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BottomNavigation from '../BottomNavigation';

// Mock NavigationItem
jest.mock('../NavigationItem', () => {
  return function MockNavigationItem({ label, color }: any) {
    return <div data-testid="nav-item" data-color={color}>{label}</div>;
  };
});

describe('BottomNavigation Component - Color Coding', () => {
  it('should render FPL item with fpl color', () => {
    render(<BottomNavigation />);
    
    const fplItem = screen.getByText('FPL');
    expect(fplItem.closest('[data-color]')).toHaveAttribute('data-color', 'fpl');
  });

  it('should render Team item with team color', () => {
    render(<BottomNavigation />);
    
    const teamItem = screen.getByText('Team');
    expect(teamItem.closest('[data-color]')).toHaveAttribute('data-color', 'team');
  });

  it('should render Dashboard with neutral color', () => {
    render(<BottomNavigation />);
    
    const dashboardItem = screen.getByText('Dashboard');
    expect(dashboardItem.closest('[data-color]')).toHaveAttribute('data-color', 'neutral');
  });

  it('should render Analytics with fpl color', () => {
    render(<BottomNavigation />);
    
    const analyticsItem = screen.getByText('Analytics');
    expect(analyticsItem.closest('[data-color]')).toHaveAttribute('data-color', 'fpl');
  });

  it('should render Settings with neutral color', () => {
    render(<BottomNavigation />);
    
    const settingsItem = screen.getByText('Settings');
    expect(settingsItem.closest('[data-color]')).toHaveAttribute('data-color', 'neutral');
  });

  it('should have proper accessibility attributes', () => {
    const { container } = render(<BottomNavigation />);
    
    const nav = container.querySelector('nav');
    expect(nav).toHaveAttribute('role', 'navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('should be hidden on desktop (lg:hidden)', () => {
    const { container } = render(<BottomNavigation />);
    
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('lg:hidden');
  });

  it('should be fixed at bottom', () => {
    const { container } = render(<BottomNavigation />);
    
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('fixed');
    expect(nav).toHaveClass('bottom-0');
  });
});

