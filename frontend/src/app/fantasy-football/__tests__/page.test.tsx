/**
 * Tests for Fantasy Football Overview Page
 * 
 * Tests the fantasy-football page to ensure:
 * - Page structure is correct
 * - Header displays
 * - Sub-navigation displays
 * - Content renders
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock components
jest.mock('@/components/pages/FPLPageHeader', () => {
  return function MockFPLPageHeader({ title, subtitle }: any) {
    return <div data-testid="fpl-page-header">{title} - {subtitle}</div>;
  };
});

jest.mock('@/components/navigation/SubNavigation', () => {
  return function MockSubNavigation({ type, items }: any) {
    return (
      <div data-testid="sub-navigation" data-type={type}>
        {items.map((item: any) => (
          <div key={item.href}>{item.label}</div>
        ))}
      </div>
    );
  };
});

// Mock the page component
const FantasyFootballPage = require('../page').default;

describe('Fantasy Football Overview Page', () => {
  it('should render FPL page header', () => {
    render(<FantasyFootballPage />);
    
    const header = screen.getByTestId('fpl-page-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent('Fantasy Football');
  });

  it('should render sub-navigation', () => {
    render(<FantasyFootballPage />);
    
    const subNav = screen.getByTestId('sub-navigation');
    expect(subNav).toBeInTheDocument();
    expect(subNav).toHaveAttribute('data-type', 'fpl');
  });

  it('should render all sub-navigation items', () => {
    render(<FantasyFootballPage />);
    
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Squad')).toBeInTheDocument();
    expect(screen.getByText('Transfers')).toBeInTheDocument();
    expect(screen.getByText('Captain')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Leagues')).toBeInTheDocument();
    expect(screen.getByText('News')).toBeInTheDocument();
  });

  it('should render placeholder content', () => {
    render(<FantasyFootballPage />);
    
    expect(screen.getByText(/Fantasy Football overview coming soon/i)).toBeInTheDocument();
  });
});

