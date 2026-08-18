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
            {
                source: "/about",
                destination: "/portfolio",
                permanent: true,
            },
            {
                source: "/intro",
                destination: "/",
                permanent: true,
            },
            {
                source: "/project",
                destination: "/portfolio",
                permanent: true,
            },
            {
                source: "/projects",
                destination: "/portfolio",
                permanent: true,
            },
            {
                source: "/work",
                destination: "/portfolio",
                permanent: true,
            },
            {
                source: "/works",
                destination: "/portfolio",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
