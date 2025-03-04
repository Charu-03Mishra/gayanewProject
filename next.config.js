// next.config.js
/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals.push('request');
    }
    return config;
  },
};
