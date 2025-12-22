'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  deadline: Date;
  onExpire?: () => void;
}

export default function CountdownTimer({
  deadline,
  onExpire,
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const deadlineTime = new Date(deadline).getTime();
      const difference = deadlineTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        if (onExpire) onExpire();
        return;
      }

      setTimeRemaining({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  if (isExpired) {
    return (
      <div className="text-center">
        <div className="text-lg font-bold text-[var(--pl-pink)]">Picks Locked</div>
      </div>
    );
  }

  const totalHours = timeRemaining.days * 24 + timeRemaining.hours;
  const isUrgent = totalHours < 1;
  const isWarning = totalHours < 24;

  return (
    <div className={`text-center ${isUrgent ? 'text-[var(--pl-pink)] animate-pulse' : isWarning ? 'text-yellow-400' : 'text-[var(--pl-green)]'}`}>
      <div className="text-sm font-medium mb-2">Time until lock:</div>
      <div className="text-2xl sm:text-3xl font-bold">
        {timeRemaining.days > 0 && `${timeRemaining.days}d `}
        {timeRemaining.hours}h {timeRemaining.minutes}m
      </div>
    </div>
  );
}

