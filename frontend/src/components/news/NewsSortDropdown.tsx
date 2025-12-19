'use client';

import { useState, useRef, useEffect } from 'react';

interface NewsSortDropdownProps {
  sortBy: 'recent' | 'important' | 'category';
  onSortChange: (sort: 'recent' | 'important' | 'category') => void;
}

export default function NewsSortDropdown({
  sortBy,
  onSortChange,
}: NewsSortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions: Array<{ key: 'recent' | 'important' | 'category'; label: string }> = [
    { key: 'recent', label: 'Most Recent' },
    { key: 'important', label: 'Most Important' },
    { key: 'category', label: 'By Category' },
  ];

  const currentLabel = sortOptions.find((opt) => opt.key === sortBy)?.label || 'Most Recent';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-transparent border border-white/10 text-[var(--pl-text-muted)] hover:border-white/20 transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)]"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Sort news"
      >
        <span>{currentLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[var(--pl-dark)] border border-white/10 shadow-lg z-50 overflow-hidden">
          {sortOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => {
                onSortChange(option.key);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] ${
                sortBy === option.key
                  ? 'bg-[var(--team-primary)]/20 text-white'
                  : 'text-[var(--pl-text-muted)] hover:bg-white/5'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

