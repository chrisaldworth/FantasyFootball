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
  // Logo is square (400x400), so aspect ratio is 1:1 for all variants
  const aspectRatio = 1;
  const height = logoSize;

  const logoElement = (
    <div 
      className={`flex items-center ${className}`} 
      style={{ 
        width: logoSize,
        height: logoSize,
        backgroundColor: 'transparent'
      }}
    >
      <Image
        src={getLogoPath()}
        alt="Fotmate"
        width={logoSize}
        height={logoSize}
        className="object-contain w-full h-full"
        style={{ mixBlendMode: 'normal' }}
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

