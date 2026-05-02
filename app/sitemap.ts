import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://yencheng.dev/",
            priority: 1,
            lastModified: new Date(),
        },
        {
            url: "https://yencheng.dev/portfolio",
            priority: 0.9,
            lastModified: new Date(),
        },
        {
            url: "https://yencheng.dev/travel",
            priority: 0.85,
            lastModified: new Date(),
        },
        {
            url: "https://yencheng.dev/raycast",
            priority: 0.85,
            lastModified: new Date(),
        },
        {
            url: "https://yencheng.dev/finder",
            priority: 0.8,
            lastModified: new Date(),
        },
        {
            url: "https://yencheng.dev/photo",
            priority: 0.7,
            lastModified: new Date(),
        },
        {
            url: "https://yencheng.dev/instagram",
            priority: 0.6,
            lastModified: new Date(),
        },
    ];
}
