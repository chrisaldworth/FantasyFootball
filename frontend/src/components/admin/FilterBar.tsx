'use client';

import { ReactNode } from 'react';

interface FilterBarProps {
  children: ReactNode;
  onClear?: () => void;
  showClearButton?: boolean;
}

export default function FilterBar({
  children,
  onClear,
  showClearButton = true,
}: FilterBarProps) {
  return (
    <div className="glass rounded-xl p-4 bg-[#1a1a1a] border border-[#2a2a2a] mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 flex flex-wrap gap-4">{children}</div>
        {showClearButton && onClear && (
          <button
            onClick={onClear}
            className="px-4 py-2 text-sm text-[#999999] hover:text-white transition-colors border border-[#2a2a2a] rounded-lg hover:border-[#3a3a3a]"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

