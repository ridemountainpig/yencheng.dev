import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "files.raycast.com",
            },
        ],
    },
};

export default nextConfig;
