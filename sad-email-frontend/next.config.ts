import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production
  experimental: {
    optimizePackageImports: ['@radix-ui/react-slot', 'lucide-react']
  }
};

export default nextConfig;
