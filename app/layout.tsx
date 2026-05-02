import type { Metadata } from "next";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { Rwdot } from "rwdot";
import "./globals.css";

const nunito = localFont({
    src: "./fonts/NunitoBold.woff2",
    variable: "--font-nunito",
    preload: true,
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://yencheng.dev"),
    title: {
        default: "Yen Cheng Lin — Full-Stack Developer & Raycast Ambassador",
        template: "%s — Yen Cheng Lin",
    },
    description:
        "Full-stack developer from Taiwan. Building web apps with Next.js, contributing to open-source projects, and creating Raycast extensions. Raycast Ambassador based in Taichung.",
    keywords: [
        "Yen Cheng Lin",
        "Yen Cheng",
        "Ridemountainpig",
        "林彥成",
        "Full-Stack Developer",
        "Raycast Ambassador",
        "Taiwan Developer",
    ],
    authors: [
        {
            name: "Yen Cheng Lin",
            url: "https://yencheng.dev",
        },
    ],
    verification: {
        google: "UmkdCtHuAz2VyuxgE8Th1jTiDJQccNGUEBivQ8d96Vc",
    },
    openGraph: {
        type: "website",
        url: "https://yencheng.dev/",
        title: "Yen Cheng Lin — Full-Stack Developer & Raycast Ambassador",
        description:
            "Full-stack developer from Taiwan. Building web apps with Next.js, contributing to open-source projects, and creating Raycast extensions.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Yen Cheng Lin — Full-Stack Developer & Raycast Ambassador",
        description:
            "Full-stack developer from Taiwan. Building web apps with Next.js, contributing to open-source projects, and creating Raycast extensions.",
        site: "@ridemountainpig",
        creator: "@ridemountainpig",
    },
};

const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Yen Cheng Lin",
    alternateName: "ridemountainpig",
    url: "https://yencheng.dev",
    jobTitle: "Full-Stack Developer",
    description:
        "Full-stack developer from Taiwan, Raycast Ambassador, and open-source contributor.",
    address: {
        "@type": "PostalAddress",
        addressLocality: "Taichung",
        addressCountry: "TW",
    },
    sameAs: [
        "https://github.com/ridemountainpig",
        "https://www.linkedin.com/in/iamyencheng/",
        "https://x.com/ridemountainpig",
        "https://blog.yencheng.dev",
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(personSchema),
                    }}
                />
            </head>
            <body
                className={`${nunito.variable} bg-white-black-50 antialiased`}
            >
                <GoogleAnalytics gaId="G-D5P23L59BL" />
                <Analytics />
                <Rwdot
                    position="bottom-right"
                    show={process.env.RWDOT == "dev"}
                />
                {children}
            </body>
        </html>
    );
}
