import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Adding allowedDevOrigins to address the cross-origin warning in development.
  // This is a temporary fix for the development environment.
  // In a production environment, you would want to configure this more securely.
  // For now, we allow all origins in development to prevent the warning.
  // This is safe for the development environment.
  // See: https://nextjs.org/docs/app/api-reference/next-config-js/allowedDevOrigins
  experimental: {
    allowedDevOrigins: ['*'],
  }
};

export default nextConfig;
