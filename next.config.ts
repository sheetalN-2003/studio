
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  devIndicators: {
    allowedDevOrigins: [
      "*.cluster-52r6vzs3ujeoctkkxpjif3x34a.cloudworkstations.dev",
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*.cluster-52r6vzs3ujeoctkkxpjif3x34a.cloudworkstations.dev"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
