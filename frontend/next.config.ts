import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Capacitor
  // Note: Admin routes use dynamic rendering and are excluded from static export
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Ensure trailing slashes for proper routing in native apps
  trailingSlash: true,
  
  // Skip static generation for admin routes (they're client-side only)
  // This is handled by generateStaticParams returning empty array
};

export default nextConfig;
