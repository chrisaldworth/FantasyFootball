'use client';

import { useState } from 'react';
import OnboardingWizard from './OnboardingWizard';

interface FPLConnectionPromptProps {
  variant?: 'card' | 'banner' | 'full-page';
  title?: string;
  subtitle?: string;
  onConnected?: () => void;
}

export default function FPLConnectionPrompt({
  variant = 'card',
  title = 'Connect Your FPL Team',
  subtitle = "Link your Fantasy Premier League account to see your squad, track your rank, and get personalized insights.",
  onConnected,
}: FPLConnectionPromptProps) {
  const [showWizard, setShowWizard] = useState(false);

  if (variant === 'banner') {
    return (
      <>
        <div className="bg-gradient-to-r from-[var(--pl-purple)]/20 to-[var(--pl-pink)]/20 border border-[var(--pl-purple)]/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--pl-purple)] to-[var(--pl-pink)] flex items-center justify-center shrink-0">
              <span className="text-xl">⚽</span>
            </div>
            <div>
              <p className="font-medium text-white">{title}</p>
              <p className="text-sm text-gray-400">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--pl-purple)] to-[var(--pl-pink)] text-white font-medium text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Connect Now
          </button>
        </div>
        <OnboardingWizard
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
          onComplete={onConnected}
        />
      </>
    );
  }

  if (variant === 'full-page') {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--pl-purple)]/20 to-[var(--pl-pink)]/20 flex items-center justify-center mb-6">
            <span className="text-5xl">⚽</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">{title}</h2>
          <p className="text-gray-400 max-w-md mb-8">{subtitle}</p>
          
          <div className="space-y-4 w-full max-w-sm">
            <button
              onClick={() => setShowWizard(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--pl-purple)] to-[var(--pl-pink)] text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Connect FPL Account
            </button>
            
            <div className="text-sm text-gray-500">
              Don't have an FPL account?{' '}
              <a
                href="https://fantasy.premierleague.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--pl-cyan)] hover:underline"
              >
                Create one here
              </a>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <span className="text-2xl mb-2 block">📊</span>
              <h3 className="font-medium text-sm mb-1">Track Rankings</h3>
              <p className="text-xs text-gray-400">See your overall and mini-league positions</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <span className="text-2xl mb-2 block">👑</span>
              <h3 className="font-medium text-sm mb-1">Captain Picks</h3>
              <p className="text-xs text-gray-400">Get AI-powered captain recommendations</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <span className="text-2xl mb-2 block">🔄</span>
              <h3 className="font-medium text-sm mb-1">Transfer Tips</h3>
              <p className="text-xs text-gray-400">Smart suggestions to improve your squad</p>
            </div>
          </div>
        </div>
        <OnboardingWizard
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
          onComplete={onConnected}
        />
      </>
    );
  }

  // Default card variant
  return (
    <>
      <div className="glass rounded-2xl p-6 text-center">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--pl-purple)]/20 to-[var(--pl-pink)]/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚽</span>
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">{subtitle}</p>
        <button
          onClick={() => setShowWizard(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--pl-purple)] to-[var(--pl-pink)] text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Connect Account
        </button>
        <p className="text-xs text-gray-500 mt-4">
          Quick setup takes less than 30 seconds
        </p>
      </div>
      <OnboardingWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={onConnected}
      />
    </>
  );
}
