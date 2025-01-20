import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/_next/static/media/"],
        },
        sitemap: "https://www.yencheng.dev/sitemap.xml",
    };
}
