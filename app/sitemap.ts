import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://www.yencheng.dev/",
            priority: 1,
            lastModified: new Date(),
        },
        {
            url: "https://www.yencheng.dev/finder",
            priority: 0.8,
            lastModified: new Date(),
        },
        {
            url: "https://www.yencheng.dev/finder/resume.pdf",
            priority: 0.64,
            lastModified: new Date(),
        },
    ];
}
