'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import FPLTeamIdHelper from './FPLTeamIdHelper';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

type Step = 'welcome' | 'choose-method' | 'team-id' | 'success';

export default function OnboardingWizard({ isOpen, onClose, onComplete }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [teamId, setTeamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTeamIdFound = (id: string) => {
    setTeamId(id);
  };

  const handleSaveTeamId = async () => {
    if (!teamId.trim()) {
      setError('Please enter your FPL Team ID');
      return;
    }

    const numericId = parseInt(teamId.trim());
    if (isNaN(numericId)) {
      setError('Team ID must be a number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.updateFplTeamId(numericId);
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save Team ID. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    onClose();
    if (onComplete) {
      onComplete();
    }
    router.push('/fantasy-football');
  };

  const handleSkip = () => {
    onClose();
    router.push('/dashboard');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#1a1a2e] rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Progress Indicator */}
        <div className="flex gap-2 px-6 pt-6">
          {['welcome', 'choose-method', 'team-id', 'success'].map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                ['welcome', 'choose-method', 'team-id', 'success'].indexOf(step) >= i
                  ? 'bg-[var(--pl-green)]'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <div className="p-6">
          {/* Welcome Step */}
          {step === 'welcome' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--pl-purple)] to-[var(--pl-pink)] flex items-center justify-center mx-auto">
                <span className="text-4xl">⚽</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome to FPL Companion!</h2>
                <p className="text-gray-400">
                  Let's get you set up so you can track your Fantasy Premier League team
                  and get personalized insights.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setStep('choose-method')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--pl-purple)] to-[var(--pl-pink)] text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Get Started
                </button>
                <button
                  onClick={handleSkip}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* Choose Method Step */}
          {step === 'choose-method' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Connect Your FPL Account</h2>
                <p className="text-gray-400 text-sm">
                  Choose how you'd like to connect your Fantasy Premier League team
                </p>
              </div>

              <div className="space-y-4">
                {/* Option 1: Team ID Only */}
                <button
                  onClick={() => setStep('team-id')}
                  className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--pl-green)]/50 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[var(--pl-green)]/20 flex items-center justify-center shrink-0">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-hover:text-[var(--pl-green)] transition-colors">
                        Quick Setup (Recommended)
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Just enter your FPL Team ID to view your team, track rankings, and get insights.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--pl-green)]/20 text-[var(--pl-green)]">
                          Takes 30 seconds
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                          No password needed
                        </span>
                      </div>
                    </div>
                    <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
                  </div>
                </button>

                {/* Option 2: Full Linking (Future) */}
                <div className="w-full p-4 rounded-xl bg-white/5 border border-white/10 opacity-60">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[var(--pl-purple)]/20 flex items-center justify-center shrink-0">
                      <span className="text-2xl">🔐</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">Full Account Access</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Link with your FPL credentials to make transfers and changes directly from this app.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('welcome')}
                className="w-full py-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Team ID Entry Step */}
          {step === 'team-id' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Enter Your FPL Team ID</h2>
                <p className="text-gray-400 text-sm">
                  You can paste your FPL team URL or enter the Team ID directly
                </p>
              </div>

              <FPLTeamIdHelper onTeamIdFound={handleTeamIdFound} />

              {/* Manual Entry */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Or enter Team ID manually
                </label>
                <input
                  type="text"
                  value={teamId}
                  onChange={(e) => {
                    setTeamId(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g., 1234567"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--pl-green)] focus:ring-1 focus:ring-[var(--pl-green)] outline-none transition-colors"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('choose-method')}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSaveTeamId}
                  disabled={loading || !teamId.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[var(--pl-purple)] to-[var(--pl-pink)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-[var(--pl-green)]/20 flex items-center justify-center mx-auto">
                <span className="text-4xl">✓</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--pl-green)] mb-2">You're All Set!</h2>
                <p className="text-gray-400">
                  Your FPL team has been connected. Here's what you can do now:
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[var(--pl-green)]">✓</span>
                  <span className="text-sm">View your current squad and points</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--pl-green)]">✓</span>
                  <span className="text-sm">Track your overall and gameweek rankings</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--pl-green)]">✓</span>
                  <span className="text-sm">Get transfer suggestions and captain picks</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--pl-green)]">✓</span>
                  <span className="text-sm">View your mini-league standings</span>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--pl-green)] to-[var(--pl-cyan)] text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Go to My FPL Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
