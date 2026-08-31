/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "images.unsplash.com", "ui-avatars.com"],
  },
};

module.exports = nextConfig;
