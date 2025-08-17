/** @type {import('next').NextConfig} */
const nextConfig = {
  // Unblock builds on Render
  eslint: { ignoreDuringBuilds: true },
  // If you want to skip TS type errors in prod builds too, uncomment:
  // typescript: { ignoreBuildErrors: true },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  webpack: (config, { isServer }) => {
    // prevent native node bindings from being bundled on the client
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'onnxruntime-node': false,
    };

    // avoid unnecessary polyfills on the client
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      vm: false,
    };

    // exclude old files from compilation
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
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

};
module.exports = nextConfig;
