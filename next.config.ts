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
    async redirects() {
        return [
            {
                source: "/home",
                destination: "/",
                permanent: true,
            },
            {
                source: "/contact",
                destination: "/footer",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
