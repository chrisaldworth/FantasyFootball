# Frontend Testing Guide

This guide explains how to run and write tests for the frontend application.

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## 📁 Test Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── dashboard/
│   │       └── __tests__/
│   │           ├── KeyAlerts.test.tsx
│   │           └── HeroSection.test.tsx
│   └── utils/
│       └── __tests__/
│           └── alertCalculations.test.ts
├── jest.config.js
└── jest.setup.js
```

## 🧪 Test Files

### Unit Tests
- **`src/utils/__tests__/alertCalculations.test.ts`**: Tests alert calculation logic
  - Injury detection
  - FPL squad alerts
  - Favorite team alerts
  - Edge cases

### Component Tests
- **`src/components/dashboard/__tests__/KeyAlerts.test.tsx`**: Tests KeyAlerts component
  - Rendering
  - Action buttons
  - Accessibility
  - Alert types

- **`src/components/dashboard/__tests__/HeroSection.test.tsx`**: Tests HeroSection component
  - Conditional rendering
  - Responsive layouts
  - Component integration

## ✍️ Writing Tests

### Test File Naming
- Unit tests: `*.test.ts`
- Component tests: `*.test.tsx`
- Place in `__tests__` directory or next to source file

### Example Test Structure
```typescript
import { describe, it, expect } from '@jest/globals';

describe('Feature Name', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Component Testing Example
```typescript
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## 🎯 Test Coverage Goals

- **Unit Tests**: >80% coverage for business logic
- **Component Tests**: >90% coverage for UI components
- **Critical Paths**: 100% coverage

## 📊 Viewing Coverage

After running `npm run test:coverage`, open:
```
frontend/coverage/lcov-report/index.html
```

## 🔧 Configuration

### Jest Config
- **File**: `jest.config.js`
- **Features**: Next.js integration, TypeScript, path aliases

### Jest Setup
- **File**: `jest.setup.js`
- **Features**: Jest DOM matchers, Testing Library setup

## 🐛 Troubleshooting

### Tests not running
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
- Ensure `@types/jest` is installed
- Check `tsconfig.json` includes test files

### Module resolution issues
- Check `jest.config.js` has correct `moduleNameMapper`
- Verify path aliases match `tsconfig.json`

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)

