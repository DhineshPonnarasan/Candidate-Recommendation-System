/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  webpack: (config, { isServer }) => {
    // prevent native node bindings from being bundled on the client
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'onnxruntime-node': false,
    };

    // (optional) avoid polyfills that @xenova/transformers doesn't need on the client
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      vm: false,
    };

    // Exclude old files from compilation
    config.module.rules.push({
      test: /\.(tsx?|jsx?)$/,
      exclude: [
        /node_modules/,
        /\.old\.(tsx?|jsx?)$/,
        /_old\.(tsx?|jsx?)$/,
        /\.(old)\.(tsx?|jsx?)$/,
      ],
    });

    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5000/api/:path*', // proxy to Flask
      },
    ];
  },
};

module.exports = nextConfig;
