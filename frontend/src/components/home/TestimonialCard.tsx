'use client';

import { useState, useEffect } from 'react';

interface Testimonial {
  quote: string;
  author: string;
  rank?: number;
  points?: number;
  avatar?: string;
}

interface TestimonialCardProps {
  testimonials: Testimonial[];
  autoRotate?: boolean;
  rotationInterval?: number;
}

export default function TestimonialCard({
  testimonials,
  autoRotate = true,
  rotationInterval = 5000,
}: TestimonialCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoRotate || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsVisible(true);
      }, 300); // Fade out duration
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotationInterval, testimonials.length]);

  const current = testimonials[currentIndex];

  const formatRank = (rank?: number) => {
    if (!rank) return null;
    return `#${rank.toLocaleString()}`;
  };

  const formatPoints = (points?: number) => {
    if (!points) return null;
    return `${points.toLocaleString()} pts`;
  };

  return (
    <div className="glass rounded-xl p-6 sm:p-8">
      <div
        className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="text-4xl mb-4">"</div>
        <p className="text-lg sm:text-xl text-white mb-6 italic">
          {current.quote}
        </p>
        <div className="flex items-center gap-4">
          {current.avatar && (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--pl-green)] to-[var(--pl-cyan)] flex items-center justify-center text-xl">
              {current.avatar}
            </div>
          )}
          <div>
            <div className="font-semibold text-white">{current.author}</div>
            <div className="text-sm text-[var(--pl-text-muted)] flex gap-3">
              {current.rank && <span>{formatRank(current.rank)}</span>}
              {current.points && <span>{formatPoints(current.points)}</span>}
            </div>
          </div>
        </div>
        {testimonials.length > 1 && (
          <div className="flex gap-2 justify-center mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => {
                    setCurrentIndex(index);
                    setIsVisible(true);
                  }, 300);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-[var(--pl-green)] w-6'
                    : 'bg-[var(--pl-text-muted)]/50'
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



