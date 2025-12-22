'use client';

import { useState } from 'react';

interface InviteCodeDisplayProps {
  code: string;
  leagueName: string;
  onCopy: () => void;
  onShare: () => void;
}

export default function InviteCodeDisplay({
  code,
  leagueName,
  onCopy,
  onShare,
}: InviteCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const inviteLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/weekly-picks/leagues/join?code=${code}`
    : '';

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      <div className="text-center mb-6">
        <div className="text-sm text-[var(--pl-text-muted)] mb-2">League:</div>
        <div className="text-lg font-semibold text-white">{leagueName}</div>
      </div>

      <div className="mb-6">
        <div className="text-sm text-[var(--pl-text-muted)] mb-2 text-center">Invite Code:</div>
        <div className="bg-[var(--pl-dark)]/50 rounded-lg p-4 text-center border-2 border-[var(--pl-green)]/30">
          <div className="text-3xl font-mono font-bold text-[var(--pl-green)] tracking-wider">
            {code}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCopy}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Code
            </>
          )}
        </button>
        <button
          onClick={onShare}
          className="btn-secondary flex-1 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Link
        </button>
      </div>

      {inviteLink && (
        <div className="mt-4 p-3 bg-[var(--pl-dark)]/50 rounded-lg">
          <div className="text-xs text-[var(--pl-text-muted)] mb-1">Invite Link:</div>
          <div className="text-xs text-white break-all font-mono">{inviteLink}</div>
        </div>
      )}
    </div>
  );
}

