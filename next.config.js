/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "images.unsplash.com", "ui-avatars.com"],
  },
  // experimental: { // ✅ You can delete this entire block
  //   serverActions: true,
  // },
};
