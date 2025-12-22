'use client';

import { useState, useEffect } from 'react';

interface Screenshot {
  image: string;
  title: string;
  description: string;
}

interface ScreenshotCarouselProps {
  screenshots: Screenshot[];
  autoPlay?: boolean;
  interval?: number;
}

export default function ScreenshotCarousel({
  screenshots,
  autoPlay = true,
  interval = 5000,
}: ScreenshotCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!autoPlay || screenshots.length <= 1) return;

    const intervalId = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % screenshots.length);
        setIsTransitioning(false);
      }, 300);
    }, interval);

    return () => clearInterval(intervalId);
  }, [autoPlay, interval, screenshots.length]);

  const goToSlide = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  const current = screenshots[currentIndex];

  return (
    <div className="glass rounded-xl p-6 sm:p-8 overflow-hidden">
      <div className="text-center mb-6">
        <h3 className="text-2xl sm:text-3xl font-bold mb-2">See Fotmate in Action</h3>
        <p className="text-[var(--pl-text-muted)]">
          {current.title}
        </p>
      </div>

      {/* Screenshot */}
      <div className="relative mb-6 rounded-lg overflow-hidden bg-[var(--pl-dark)]/50">
        <div
          className={`transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {current.image ? (
            <img
              src={current.image}
              alt={current.title}
              className="w-full h-auto"
            />
          ) : (
            <div className="aspect-video flex items-center justify-center text-[var(--pl-text-muted)]">
              <div className="text-center">
                <div className="text-4xl mb-2">📱</div>
                <div>{current.title}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-center text-[var(--pl-text-muted)] mb-6">
        {current.description}
      </p>

      {/* Navigation dots */}
      {screenshots.length > 1 && (
        <div className="flex gap-2 justify-center">
          {screenshots.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-[var(--pl-green)] w-6'
                  : 'bg-[var(--pl-text-muted)]/50'
              }`}
              aria-label={`View screenshot ${index + 1}: ${screenshots[index].title}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

