'use client';

import Link from 'next/link';
import { useRef, useEffect, useState, Children, cloneElement, isValidElement, ReactElement } from 'react';
import SectionHeader from '../sections/SectionHeader';

interface DashboardSectionProps {
  type: 'fpl' | 'team';
  title: string;
  subtitle?: string;
  icon?: string;
  teamLogo?: string;
  teamName?: string;
  children: React.ReactNode;
  viewAllHref: string;
}

export default function DashboardSection({
  type,
  title,
  subtitle,
  icon,
  teamLogo,
  teamName,
  children,
  viewAllHref,
}: DashboardSectionProps) {
  const isFPL = type === 'fpl';
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const borderColor = isFPL
    ? 'border-[var(--fpl-primary)]'
    : 'border-[var(--pl-cyan)]';

  const bgColor = isFPL
    ? 'bg-[var(--fpl-bg-tint)]'
    : 'bg-[var(--pl-cyan)]/10';

  const glowColor = isFPL
    ? 'shadow-[0_0_30px_rgba(0,255,135,0.15)]'
    : 'shadow-[0_0_30px_rgba(4,245,255,0.15)]';

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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Wrap children with staggered animation
  const animatedChildren = Children.map(children, (child, index) => {
    if (isValidElement(child)) {
      return (
        <div
          className={`transition-all duration-500 ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: `${(index + 1) * 100}ms` }}
        >
          {child}
        </div>
      );
    }
    return child;
  });

  return (
    <div
      ref={sectionRef}
      className={`
        rounded-2xl border-[4px] ${borderColor} ${bgColor} ${isVisible ? glowColor : ''}
        p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 lg:mb-10 overflow-hidden
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      {/* Section Header with fade-in animation */}
      <div
        className={`transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}
      >
        <SectionHeader
          type={type}
          title={title}
          subtitle={subtitle}
          icon={icon}
          teamLogo={teamLogo}
          teamName={teamName}
          className="px-0 pb-4 mb-6"
        />
      </div>

      {/* Preview Content with staggered animations */}
      <div className="space-y-6">
        {animatedChildren}
      </div>

      {/* View All Button with delayed entrance */}
      <div
        className={`mt-8 flex justify-center transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '600ms' }}
      >
        <Link
          href={viewAllHref}
          className={`
            w-full sm:w-auto px-6 py-3 rounded-lg border-2 font-semibold 
            transition-all duration-300 flex items-center justify-center gap-2
            hover:scale-105 hover:shadow-lg active:scale-95
            ${
              isFPL
                ? 'border-[var(--fpl-primary)] text-[var(--fpl-primary)] hover:bg-[var(--fpl-primary)] hover:text-[var(--fpl-text-on-primary)] hover:shadow-[0_0_20px_rgba(0,255,135,0.3)]'
                : 'border-[var(--pl-cyan)] text-[var(--pl-cyan)] hover:bg-[var(--pl-cyan)] hover:text-white hover:shadow-[0_0_20px_rgba(4,245,255,0.3)]'
            }
          `}
        >
          <span>View All {title}</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}

