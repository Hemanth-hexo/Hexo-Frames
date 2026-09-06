import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost:3000", "192.168.1.45:3000", "192.168.1.45"],
};

export default nextConfig;
