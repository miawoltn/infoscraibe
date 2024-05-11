/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/dashboard',
        destination: '/chat',
      },
    ]
  },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'img.clerk.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
    webpack: (
      config,
      { buildId, dev, isServer, defaultLoaders, webpack }
    ) => {
      config.resolve.alias.canvas = false
      config.resolve.alias.encoding = false
      return config
    },
  };
  
export default nextConfig;