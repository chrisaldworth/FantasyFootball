'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log detailed error information for debugging
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error message:', error.message);
    console.error('[ErrorBoundary] Error stack:', error.stack);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    
    // Log helpful information for minified React errors
    if (error.message.includes("Minified React error")) {
      console.error('⚠️ This is a minified React error. Check the React error code at https://react.dev/errors');
      console.error('Common causes:');
      console.error('  - Hooks called conditionally or in different orders');
      console.error('  - Multiple React instances');
      console.error('  - Component unmounting during state update');
      console.error('  - Conditional rendering causing hook order changes');
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-2xl w-full glass rounded-2xl p-8">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
            {this.state.error && (
              <div className="mb-4">
                <p className="text-white font-semibold mb-2">Error:</p>
                <pre className="bg-black/30 p-4 rounded-lg overflow-auto text-sm text-red-300">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
            {this.state.errorInfo && (
              <div className="mb-4">
                <p className="text-white font-semibold mb-2">Stack trace:</p>
                <pre className="bg-black/30 p-4 rounded-lg overflow-auto text-xs text-gray-300 max-h-64">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="mt-4 px-4 py-2 bg-[var(--pl-green)] text-white rounded-lg hover:bg-[var(--pl-green)]/80"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
