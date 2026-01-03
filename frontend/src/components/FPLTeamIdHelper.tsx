'use client';

import { useState } from 'react';

interface FPLTeamIdHelperProps {
  onTeamIdFound?: (teamId: string) => void;
}

export default function FPLTeamIdHelper({ onTeamIdFound }: FPLTeamIdHelperProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [extractedId, setExtractedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const extractTeamIdFromUrl = (url: string): string | null => {
    // Match patterns like:
    // https://fantasy.premierleague.com/entry/1234567/event/1
    // https://fantasy.premierleague.com/entry/1234567/history
    // https://fantasy.premierleague.com/entry/1234567
    const patterns = [
      /fantasy\.premierleague\.com\/entry\/(\d+)/,
      /entry\/(\d+)/,
      /^(\d+)$/, // Just the ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const handleUrlChange = (value: string) => {
    setUrlInput(value);
    setError('');
    setExtractedId(null);

    if (!value.trim()) return;

    const teamId = extractTeamIdFromUrl(value.trim());
    if (teamId) {
      setExtractedId(teamId);
    }
  };

  const handleUseId = () => {
    if (extractedId && onTeamIdFound) {
      onTeamIdFound(extractedId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick URL Paste */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Paste your FPL team URL or Team ID
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://fantasy.premierleague.com/entry/123456... or just 123456"
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--pl-green)] focus:ring-1 focus:ring-[var(--pl-green)] outline-none transition-colors text-sm"
          />
        </div>
        
        {extractedId && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <span className="text-green-400">✓</span>
            <span className="text-sm text-green-300">
              Found Team ID: <strong>{extractedId}</strong>
            </span>
            {onTeamIdFound && (
              <button
                onClick={handleUseId}
                className="ml-auto px-3 py-1 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
              >
                Use This ID
              </button>
            )}
          </div>
        )}

        {urlInput && !extractedId && (
          <p className="text-sm text-yellow-400">
            Couldn't extract Team ID. Try pasting the full URL or just the numeric ID.
          </p>
        )}
      </div>

      {/* Help Toggle */}
      <button
        onClick={() => setShowGuide(!showGuide)}
        className="flex items-center gap-2 text-sm text-[var(--pl-cyan)] hover:text-[var(--pl-cyan)]/80 transition-colors"
      >
        <span>{showGuide ? '▼' : '▶'}</span>
        <span>How to find your FPL Team ID</span>
      </button>

      {/* Visual Guide */}
      {showGuide && (
        <div className="bg-white/5 rounded-xl p-4 space-y-4 animate-slide-down">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--pl-purple)] flex items-center justify-center text-white font-bold shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Go to the FPL website</p>
                <p className="text-sm text-gray-400">
                  Visit{' '}
                  <a
                    href="https://fantasy.premierleague.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--pl-cyan)] hover:underline"
                  >
                    fantasy.premierleague.com
                  </a>{' '}
                  and log in to your account
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--pl-purple)] flex items-center justify-center text-white font-bold shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">Click on "Points" or view your team</p>
                <p className="text-sm text-gray-400">
                  Navigate to your team page from the main menu
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--pl-purple)] flex items-center justify-center text-white font-bold shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">Find the number in the URL</p>
                <p className="text-sm text-gray-400">
                  Look at your browser's address bar. The URL will look like:
                </p>
                <div className="mt-2 p-3 bg-black/30 rounded-lg font-mono text-sm break-all">
                  <span className="text-gray-400">https://fantasy.premierleague.com/entry/</span>
                  <span className="text-[var(--pl-green)] font-bold">1234567</span>
                  <span className="text-gray-400">/event/1</span>
                </div>
                <p className="text-sm text-[var(--pl-green)] mt-2">
                  The number in green is your Team ID!
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <h4 className="font-medium text-sm mb-2">💡 Quick Tips:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Your Team ID is always a number (usually 6-8 digits)</li>
              <li>• You can also find it on the FPL mobile app under "View Team"</li>
              <li>• Your Team ID never changes, even between seasons</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
