/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/webp'], // Use efficient WebP format
    deviceSizes: [640, 750, 828, 1080, 1200], // Limited device sizes
    imageSizes: [16, 32, 48, 64, 96], // Limited image sizes
    minimumCacheTTL: 86400, // Cache for 24 hours
    domains: ['plus.unsplash.com', 'images.unsplash.com'],
  },
  webpack: (config, { isServer }) => {
    // Optimize chunking
    config.optimization.splitChunks = {
      chunks: 'all',
      maxInitialRequests: 25,
      minSize: 20000
    };

    return config;
  },
  experimental: {
    optimizeCss: true, // Optimize CSS
    scrollRestoration: true, // Better navigation performance
  },
  poweredByHeader: false, // Remove unnecessary header
  compress: true, // Enable compression
};

module.exports = nextConfig;