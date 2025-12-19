'use client';

export default function EmptyNews() {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-4xl mb-4">📰</div>
      <h3 className="text-lg font-semibold mb-2">No News Available</h3>
      <p className="text-sm text-[var(--pl-text-muted)]">
        No news available at the moment. Check back later for updates.
      </p>
    </div>
  );
}


