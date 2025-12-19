'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: Date | string;
  label?: string;
  onComplete?: () => void;
}

export default function CountdownTimer({ targetDate, label, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        setIsComplete(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onComplete) onComplete();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
      setIsComplete(false);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  if (!timeLeft) {
    return (
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="text-sm text-[var(--pl-text-muted)]">Loading countdown...</div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="glass rounded-xl p-4 sm:p-6 border-2 border-[var(--pl-cyan)]">
        <div className="text-sm text-[var(--pl-text-muted)] mb-2">{label || 'Event'}</div>
        <div className="text-2xl sm:text-3xl font-bold text-[var(--pl-cyan)]">Started!</div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      {label && (
        <div className="text-sm text-[var(--pl-text-muted)] mb-3">{label}</div>
      )}
      <div className="flex items-center gap-2 sm:gap-4">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <div className="text-2xl sm:text-4xl font-bold text-white tabular-nums">
              {timeLeft.days}
            </div>
            <div className="text-xs text-[var(--pl-text-muted)]">d</div>
          </div>
        )}
        <div className="flex flex-col items-center">
          <div className="text-2xl sm:text-4xl font-bold text-white tabular-nums">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)]">h</div>
        </div>
        <div className="text-2xl sm:text-4xl text-[var(--pl-text-muted)]">:</div>
        <div className="flex flex-col items-center">
          <div className="text-2xl sm:text-4xl font-bold text-white tabular-nums">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)]">m</div>
        </div>
        <div className="text-2xl sm:text-4xl text-[var(--pl-text-muted)]">:</div>
        <div className="flex flex-col items-center">
          <div className="text-2xl sm:text-4xl font-bold text-white tabular-nums">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)]">s</div>
        </div>
      </div>
    </div>
  );
}

