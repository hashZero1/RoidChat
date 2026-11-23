import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 80],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "public-bucket-altf.s3.ap-south-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
