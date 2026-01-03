'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';

type AnimationType = 
  | 'fade-in'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale-in'
  | 'rotate-in'
  | 'card-entrance'
  | 'pop';

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number; // delay in ms
  duration?: number; // duration in ms
  threshold?: number; // intersection threshold 0-1
  triggerOnce?: boolean;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'aside' | 'span';
  staggerIndex?: number; // for staggered animations
  staggerDelay?: number; // delay between staggered items in ms
}

const animationClasses: Record<AnimationType, { initial: string; animate: string }> = {
  'fade-in': {
    initial: 'opacity-0',
    animate: 'opacity-100',
  },
  'slide-up': {
    initial: 'opacity-0 translate-y-8',
    animate: 'opacity-100 translate-y-0',
  },
  'slide-down': {
    initial: 'opacity-0 -translate-y-8',
    animate: 'opacity-100 translate-y-0',
  },
  'slide-left': {
    initial: 'opacity-0 translate-x-8',
    animate: 'opacity-100 translate-x-0',
  },
  'slide-right': {
    initial: 'opacity-0 -translate-x-8',
    animate: 'opacity-100 translate-x-0',
  },
  'scale-in': {
    initial: 'opacity-0 scale-90',
    animate: 'opacity-100 scale-100',
  },
  'rotate-in': {
    initial: 'opacity-0 -rotate-3 scale-95',
    animate: 'opacity-100 rotate-0 scale-100',
  },
  'card-entrance': {
    initial: 'opacity-0 translate-y-4 scale-95',
    animate: 'opacity-100 translate-y-0 scale-100',
  },
  'pop': {
    initial: 'opacity-0 scale-75',
    animate: 'opacity-100 scale-100',
  },
};

export default function AnimatedSection({
  children,
  animation = 'fade-in',
  delay = 0,
  duration = 500,
  threshold = 0.1,
  triggerOnce = true,
  className = '',
  as: Component = 'div',
  staggerIndex = 0,
  staggerDelay = 100,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const totalDelay = delay + (staggerIndex * staggerDelay);
  const { initial, animate } = animationClasses[animation];

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce) {
              observer.unobserve(element);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, triggerOnce]);

  // Render based on component type with proper ref handling
  const commonProps = {
    className: `transition-all ${className} ${isVisible ? animate : initial}`,
    style: {
      transitionDuration: `${duration}ms`,
      transitionDelay: `${totalDelay}ms`,
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' as const,
    },
  };

  // Use a switch to properly type each component
  switch (Component) {
    case 'div':
      return <div ref={ref as React.RefObject<HTMLDivElement>} {...commonProps}>{children}</div>;
    case 'section':
      return <section ref={ref as React.RefObject<HTMLElement>} {...commonProps}>{children}</section>;
    case 'article':
      return <article ref={ref as React.RefObject<HTMLElement>} {...commonProps}>{children}</article>;
    case 'aside':
      return <aside ref={ref as React.RefObject<HTMLElement>} {...commonProps}>{children}</aside>;
    case 'span':
      return <span ref={ref as React.RefObject<HTMLSpanElement>} {...commonProps}>{children}</span>;
    default:
      return <div ref={ref as React.RefObject<HTMLDivElement>} {...commonProps}>{children}</div>;
  }
}

// Helper component for staggered children animations
interface StaggeredAnimationProps {
  children: ReactNode[];
  animation?: AnimationType;
  baseDelay?: number;
  staggerDelay?: number;
  duration?: number;
  className?: string;
  itemClassName?: string;
}

export function StaggeredAnimation({
  children,
  animation = 'slide-up',
  baseDelay = 0,
  staggerDelay = 100,
  duration = 500,
  className = '',
  itemClassName = '',
}: StaggeredAnimationProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedSection
          key={index}
          animation={animation}
          delay={baseDelay}
          staggerIndex={index}
          staggerDelay={staggerDelay}
          duration={duration}
          className={itemClassName}
        >
          {child}
        </AnimatedSection>
      ))}
    </div>
  );
}
