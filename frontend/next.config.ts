import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Capacitor
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Ensure trailing slashes for proper routing in native apps
  trailingSlash: true,
};

export default nextConfig;
