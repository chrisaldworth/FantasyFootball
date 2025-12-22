'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StickyCTAProps {
  showAfterScroll?: number;
  hideAtSelector?: string;
}

export default function StickyCTA({
  showAfterScroll = 400,
  hideAtSelector,
}: StickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on mount and window resize
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleScroll = () => {
      // Don't show on desktop
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        setIsVisible(false);
        return;
      }

      const scrollY = window.scrollY;
      const isPastThreshold = scrollY > showAfterScroll;

      // Check if we've reached the hide selector
      if (hideAtSelector) {
        const element = document.querySelector(hideAtSelector) as HTMLElement | null;
        if (element) {
          const elementTop = element.getBoundingClientRect().top + window.scrollY;
          const elementBottom = elementTop + element.offsetHeight;
          const isPastElement = scrollY >= elementTop - window.innerHeight;
          setShouldHide(isPastElement && scrollY < elementBottom);
        }
      }

      setIsVisible(isPastThreshold && !shouldHide);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, [showAfterScroll, hideAtSelector, shouldHide]);

  // Only show on mobile
  if (!isMobile || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--pl-dark)] border-t border-white/10 p-4 shadow-lg md:hidden">
      <Link
        href="/register"
        className="btn-primary w-full text-center text-lg py-3 block"
      >
        Get Started for Free
      </Link>
    </div>
  );
}

