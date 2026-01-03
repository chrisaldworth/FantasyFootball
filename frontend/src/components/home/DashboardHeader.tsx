'use client';

import { useState, useEffect, useRef } from 'react';

interface DashboardHeaderProps {
  userName: string;
  rank?: number;
  points?: number;
  gameweek?: number;
}

// Animated number counter hook
function useCountUp(target: number, duration: number = 1500, enabled: boolean = true) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || target === 0) {
      setCount(target);
      return;
    }

    startTime.current = null;
    
    const animate = (currentTime: number) => {
      if (!startTime.current) startTime.current = currentTime;
      const elapsed = currentTime - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(easeOut * target);
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };
    
    requestAnimationFrame(animate);
  }, [target, duration, enabled]);
  
  return count;
}

export default function DashboardHeader({
  userName,
  rank,
  points,
  gameweek,
}: DashboardHeaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Intersection observer for entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animated counters
  const animatedRank = useCountUp(rank || 0, 2000, isVisible);
  const animatedPoints = useCountUp(points || 0, 2000, isVisible);

  const formatRank = (rank?: number) => {
    if (!rank) return 'N/A';
    return `#${rank.toLocaleString()}`;
  };

  const formatPoints = (points?: number) => {
    if (!points) return 'N/A';
    return points.toLocaleString();
  };

  return (
    <div
      ref={headerRef}
      className={`
        glass rounded-xl p-6 transition-all duration-700 ease-out
        hover:shadow-[0_0_30px_rgba(0,255,135,0.2)]
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {/* Welcome message with typing effect simulation */}
      <h2
        className={`
          text-2xl font-bold mb-4 transition-all duration-500
          ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
        `}
      >
        Welcome back,{' '}
        <span className="text-gradient-primary animate-gradient-text">{userName}</span>
        <span className="animate-pulse ml-1">👋</span>
      </h2>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Rank Stat */}
        <div
          className={`
            text-center transition-all duration-500 p-3 rounded-lg
            hover:bg-white/5 hover:scale-105 cursor-default
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="text-lg font-bold text-gradient-primary mb-1 tabular-nums">
            {rank ? `#${animatedRank.toLocaleString()}` : 'N/A'}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)] flex items-center justify-center gap-1">
            <span className="inline-block animate-bounce-subtle" style={{ animationDelay: '0s' }}>📊</span>
            Rank
          </div>
        </div>
        
        {/* Points Stat */}
        <div
          className={`
            text-center transition-all duration-500 p-3 rounded-lg
            hover:bg-white/5 hover:scale-105 cursor-default
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
          style={{ transitionDelay: '300ms' }}
        >
          <div className="text-lg font-bold text-gradient-primary mb-1 tabular-nums">
            {points ? animatedPoints.toLocaleString() : 'N/A'}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)] flex items-center justify-center gap-1">
            <span className="inline-block animate-bounce-subtle" style={{ animationDelay: '0.2s' }}>⚡</span>
            Points
          </div>
        </div>
        
        {/* Gameweek Stat */}
        <div
          className={`
            text-center transition-all duration-500 p-3 rounded-lg
            hover:bg-white/5 hover:scale-105 cursor-default
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="text-lg font-bold text-gradient-primary mb-1">
            GW {gameweek || 'N/A'}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)] flex items-center justify-center gap-1">
            <span className="inline-block animate-bounce-subtle" style={{ animationDelay: '0.4s' }}>📅</span>
            Gameweek
          </div>
        </div>
      </div>
    </div>
  );
}

