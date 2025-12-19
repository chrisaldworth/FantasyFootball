'use client';

import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  variant?: 'full' | 'icon' | 'wordmark' | 'stacked';
  color?: 'full' | 'white' | 'black' | 'gradient';
  size?: number;
  className?: string;
  href?: string;
}

export default function Logo({
  variant = 'full',
  color = 'full',
  size,
  className = '',
  href,
}: LogoProps) {
  const getLogoPath = () => {
    const variantPath = variant === 'full' ? 'full' : variant === 'icon' ? 'icon' : variant === 'wordmark' ? 'wordmark' : 'stacked';
    const colorPath = color === 'full' ? 'full-color' : color === 'white' ? 'white' : color === 'black' ? 'black' : 'gradient';
    return `/logo/${variantPath}-${colorPath}.svg`;
  };

  // Default sizes based on variant
  const getDefaultSize = () => {
    if (size) return size;
    switch (variant) {
      case 'full':
        return 120;
      case 'stacked':
        return 80;
      case 'icon':
        return 40;
      case 'wordmark':
        return 120;
      default:
        return 120;
    }
  };

  const logoSize = getDefaultSize();
  const aspectRatio = variant === 'stacked' ? 0.8 : variant === 'wordmark' ? 4.5 : variant === 'icon' ? 1 : 4;
  const height = variant === 'stacked' ? logoSize * 1.25 : variant === 'wordmark' ? logoSize / 4.5 : variant === 'icon' ? logoSize : logoSize / 4;

  const logoElement = (
    <div 
      className={`flex items-center ${className}`} 
      style={{ 
        width: variant === 'stacked' ? height : logoSize,
        height: height
      }}
    >
      <Image
        src={getLogoPath()}
        alt="Fotmate"
        width={variant === 'stacked' ? height : logoSize}
        height={height}
        className="object-contain w-full h-full"
        priority
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)] rounded">
        {logoElement}
      </Link>
    );
  }

  return logoElement;
}

