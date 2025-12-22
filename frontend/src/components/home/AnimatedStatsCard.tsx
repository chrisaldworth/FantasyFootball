'use client';

import { useState, useEffect, useRef } from 'react';

interface AnimatedStatsCardProps {
  value: number | string;
  label: string;
  suffix?: string; // e.g., "K+", "%", "★"
  duration?: number; // Animation duration in ms
  startValue?: number; // Starting value (default: 0)
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export default function AnimatedStatsCard({
  value,
  label,
  suffix = '',
  duration = 2000,
  startValue = 0,
  trend,
  trendValue,
}: AnimatedStatsCardProps) {
  const [displayValue, setDisplayValue] = useState(startValue);
  const [hasAnimated, setHasAnimated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Extract numeric value if string (e.g., "50K+" -> 50)
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0
    : value;

  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateValue();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [hasAnimated]);

  const animateValue = () => {
    const start = startValue;
    const end = numericValue;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeOut;
      
      setDisplayValue(Math.floor(current));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(animate);
  };

  const formatValue = () => {
    if (typeof value === 'string') {
      if (value.includes('K')) {
        return `${displayValue}${suffix || 'K+'}`;
      }
      if (value.includes('%')) {
        return `${displayValue}${suffix || '%'}`;
      }
      if (value.includes('★')) {
        return `${displayValue.toFixed(1)}${suffix || '★'}`;
      }
    }
    // For numeric values, format based on suffix
    if (suffix === '★') {
      return `${displayValue.toFixed(1)}${suffix}`;
    }
    return `${displayValue}${suffix}`;
  };

  const trendColor =
    trend === 'up'
      ? 'text-[var(--pl-green)]'
      : trend === 'down'
      ? 'text-[var(--pl-pink)]'
      : 'text-[var(--pl-text-muted)]';

  return (
    <div ref={cardRef} className="text-center">
      <div className="text-2xl sm:text-3xl font-bold text-gradient-primary mb-1">
        {formatValue()}
      </div>
      <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">
        {label}
      </div>
      {trend && trendValue && (
        <div className={`text-xs ${trendColor} flex items-center justify-center gap-1`}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trendValue}
        </div>
      )}
    </div>
  );
}

