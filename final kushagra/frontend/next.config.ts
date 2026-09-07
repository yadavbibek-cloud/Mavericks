import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Allows the frontend to run on any local port (including :3001) while the
    // GIS iframe and React pages share one API origin.
    return [{ source: "/api/:path*", destination: "http://127.0.0.1:8001/api/:path*" }];
  },
};

export default nextConfig;
