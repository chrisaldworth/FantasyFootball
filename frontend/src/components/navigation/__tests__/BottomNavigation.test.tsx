/**
 * Tests for BottomNavigation Component - Color Coding
 * 
 * Tests the BottomNavigation component to ensure:
 * - FPL items use FPL color
 * - More items open the More drawer
 * - Neutral items use default color and navigate directly
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BottomNavigation from '../BottomNavigation';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/dashboard',
}));

// Mock NavigationItem
jest.mock('../NavigationItem', () => {
  return function MockNavigationItem({ label, color, href }: any) {
    return <div data-testid="nav-item" data-color={color} data-href={href}>{label}</div>;
  };
});

// Mock Drawer
jest.mock('../Drawer', () => {
  return function MockDrawer({ isOpen, type, items }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="drawer" data-type={type}>
        {items.map((item: any) => (
          <div key={item.href} data-testid="drawer-item">{item.label}</div>
        ))}
      </div>
    );
  };
});

describe('BottomNavigation Component - Color Coding', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('should render Home with neutral color', () => {
    render(<BottomNavigation />);
    
    const homeItem = screen.getByText('Home');
    expect(homeItem.closest('[data-color]')).toHaveAttribute('data-color', 'neutral');
  });

  it('should render Picks with neutral color', () => {
    render(<BottomNavigation />);
    
    const picksItem = screen.getByText('Picks');
    expect(picksItem.closest('[data-color]')).toHaveAttribute('data-color', 'neutral');
  });

  it('should render Matches with neutral color', () => {
    render(<BottomNavigation />);
    
    const matchesItem = screen.getByText('Matches');
    expect(matchesItem.closest('[data-color]')).toHaveAttribute('data-color', 'neutral');
  });

  it('should render FPL button', () => {
    render(<BottomNavigation />);
    
    const fplButton = screen.getByRole('button', { name: 'FPL' });
    expect(fplButton).toBeInTheDocument();
  });

  it('should render More button', () => {
    render(<BottomNavigation />);
    
    const moreButton = screen.getByRole('button', { name: 'More' });
    expect(moreButton).toBeInTheDocument();
  });

  it('should open FPL drawer when FPL button is clicked', () => {
    render(<BottomNavigation />);
    
    const fplButton = screen.getByRole('button', { name: 'FPL' });
    fireEvent.click(fplButton);
    
    const drawer = screen.getByTestId('drawer');
    expect(drawer).toHaveAttribute('data-type', 'fpl');
  });

  it('should open More drawer when More button is clicked', () => {
    render(<BottomNavigation />);
    
    const moreButton = screen.getByRole('button', { name: 'More' });
    fireEvent.click(moreButton);
    
    const drawer = screen.getByTestId('drawer');
    expect(drawer).toHaveAttribute('data-type', 'more');
  });

  it('should have My Team and Settings in More drawer', () => {
    render(<BottomNavigation />);
    
    const moreButton = screen.getByRole('button', { name: 'More' });
    fireEvent.click(moreButton);
    
    expect(screen.getByText('My Team')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
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
