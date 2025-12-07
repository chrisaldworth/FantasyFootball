'use client';

import { useState, useEffect } from 'react';
import { fplAccountApi } from '@/lib/api';

interface LinkFPLAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinked: () => void;
}

export default function LinkFPLAccountModal({
  isOpen,
  onClose,
  onLinked,
}: LinkFPLAccountModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<{
    linked: boolean;
    fpl_email?: string;
    team_id?: number;
  } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const checkStatus = async () => {
    setCheckingStatus(true);
    try {
      const data = await fplAccountApi.getStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to check FPL account status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await fplAccountApi.linkAccount(email, password);
      if (result.success) {
        setStatus({
          linked: true,
          fpl_email: email,
          team_id: result.team_id,
        });
        onLinked();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to link account. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    setLoading(true);
    try {
      await fplAccountApi.unlinkAccount();
      setStatus({ linked: false });
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Failed to unlink:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#1a1a2e] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--pl-purple)] to-[var(--pl-pink)] flex items-center justify-center">
              <span className="text-xl">🔗</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">Link FPL Account</h2>
              <p className="text-xs text-gray-400">Enable direct team management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {checkingStatus ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : status?.linked ? (
            /* Account Linked View */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--pl-green)]/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--pl-green)] mb-2">Account Linked!</h3>
              <p className="text-gray-400 mb-4">
                Connected as <strong>{status.fpl_email}</strong>
              </p>
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <div className="text-sm text-gray-400 mb-1">Team ID</div>
                <div className="text-xl font-bold">{status.team_id}</div>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 text-left">
                <h4 className="font-semibold text-green-400 mb-2">You can now:</h4>
                <ul className="text-sm text-green-300/80 space-y-1">
                  <li>✓ Change your lineup directly</li>
                  <li>✓ Set captain/vice-captain</li>
                  <li>✓ Make transfers</li>
                  <li>✓ Activate chips (Wildcard, etc.)</li>
                </ul>
              </div>

              <button
                onClick={handleUnlink}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-400 font-medium transition-colors"
              >
                {loading ? 'Unlinking...' : 'Unlink Account'}
              </button>
            </div>
          ) : (
            /* Link Account Form */
            <form onSubmit={handleLink}>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-300">
                  <strong>Why link your account?</strong><br />
                  This allows FPL Assistant to make changes to your team directly, 
                  including transfers, captain changes, and chips.
                </p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <p className="text-sm text-yellow-300">
                  <strong>⚠️ Security Note:</strong><br />
                  Your FPL password is encrypted before storage and only used to 
                  authenticate with the official FPL website on your behalf.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    FPL Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-fpl-email@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--pl-green)] focus:ring-1 focus:ring-[var(--pl-green)] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    FPL Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your FPL password"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--pl-green)] focus:ring-1 focus:ring-[var(--pl-green)] outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-[var(--pl-purple)] to-[var(--pl-pink)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Linking...
                  </span>
                ) : (
                  'Link Account'
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Having trouble? Make sure you're using the same email and password 
                you use to log into fantasy.premierleague.com
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

