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
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!autoPlay || screenshots.length <= 1) return;

    const intervalId = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        const nextIndex = (currentIndex + 1) % screenshots.length;
        setCurrentIndex(nextIndex);
        setIsTransitioning(false);
        // Reset error state for the new slide
        setImageErrors((prev) => {
          const newSet = new Set(prev);
          newSet.delete(nextIndex);
          return newSet;
        });
      }, 300);
    }, interval);

    return () => clearInterval(intervalId);
  }, [autoPlay, interval, screenshots.length, currentIndex]);

  const goToSlide = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
      // Reset error state for the new slide to retry loading
      setImageErrors((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
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
      <div className="relative mb-6 rounded-lg overflow-hidden bg-[var(--pl-dark)]/50 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] border border-white/10">
        <div
          className={`transition-opacity duration-300 h-full ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {current.image && current.image.trim() !== '' && !imageErrors.has(currentIndex) ? (
            <img
              src={current.image}
              alt={current.title}
              className="w-full h-full object-contain"
              onError={() => {
                setImageErrors((prev) => new Set(prev).add(currentIndex));
              }}
            />
          ) : (
            <div className="h-full flex flex-col bg-gradient-to-br from-[var(--pl-dark)] to-[var(--pl-card)]">
              {/* Browser Window Mockup */}
              <div className="flex items-center gap-2 p-3 bg-[var(--pl-card)] border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="flex-1 mx-4 h-6 bg-[var(--pl-dark)]/50 rounded text-xs flex items-center px-3 text-[var(--pl-text-muted)]">
                  fotmate.com/{current.title.toLowerCase().replace(/\s+/g, '-')}
                </div>
              </div>
              
              {/* Website Content Preview */}
              <div className="flex-1 p-6 sm:p-8 lg:p-12">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="h-8 w-32 bg-[var(--pl-green)]/20 rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-8 w-20 bg-[var(--pl-card-hover)] rounded"></div>
                      <div className="h-8 w-20 bg-[var(--pl-card-hover)] rounded"></div>
                    </div>
                  </div>
                  
                  {/* Main Content Area */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="glass rounded-lg p-4 h-32">
                        <div className="h-4 w-3/4 bg-[var(--pl-green)]/30 rounded mb-3"></div>
                        <div className="h-3 w-full bg-[var(--pl-text-muted)]/20 rounded mb-2"></div>
                        <div className="h-3 w-5/6 bg-[var(--pl-text-muted)]/20 rounded"></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Large Content Card */}
                  <div className="glass rounded-xl p-6 h-48">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--pl-green)] to-[var(--pl-cyan)]"></div>
                      <div className="flex-1">
                        <div className="h-4 w-1/2 bg-[var(--pl-green)]/30 rounded mb-2"></div>
                        <div className="h-3 w-3/4 bg-[var(--pl-text-muted)]/20 rounded"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-[var(--pl-dark)]/50 rounded"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Bottom Stats */}
                  <div className="flex gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 h-20 bg-[var(--pl-card-hover)]/50 rounded-lg"></div>
                    ))}
                  </div>
                </div>
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

