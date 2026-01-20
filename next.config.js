/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable external network requests
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
