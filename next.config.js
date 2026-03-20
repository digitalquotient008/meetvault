/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  async redirects() {
    return [
      {
        source: '/meetvault-vs-booksy',
        destination: '/blog/meetvault-vs-booksy',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig
