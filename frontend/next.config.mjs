/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true }, // Required for static export if any images are used later
};

export default nextConfig;
