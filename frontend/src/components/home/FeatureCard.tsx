'use client';

import Link from 'next/link';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  href?: string;
  premium?: boolean;
}

export default function FeatureCard({
  icon,
  title,
  description,
  color,
  href,
  premium = false,
}: FeatureCardProps) {
  const cardContent = (
    <div className="glass rounded-xl p-6 hover:scale-[1.02] hover:border-[var(--pl-green)]/50 transition-all">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4"
        style={{ background: `${color}20` }}
      >
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-[var(--pl-text-muted)] mb-3">{description}</p>
      {premium && (
        <span className="inline-block px-2 py-1 rounded bg-[var(--pl-purple)]/30 text-[var(--pl-purple)] text-xs font-medium mb-3">
          Premium
        </span>
      )}
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-[var(--pl-green)] hover:underline text-sm font-medium"
        >
          Learn More
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)] rounded-xl">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

