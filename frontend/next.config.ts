/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // your config options here
  eslint: {
    ignoreDuringBuilds: true,
  },
} as any;

export default nextConfig;
