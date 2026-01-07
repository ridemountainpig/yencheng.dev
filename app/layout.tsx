import type { Metadata } from "next";
import Head from "next/head";
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
    title: "Yen Cheng Lin",
    description: "The personal website of Yen Cheng Lin.",
    keywords: ["Yen Cheng Lin", "Yen Cheng", "Ridemountainpig", "林彥成"],
    authors: [
        {
            name: "ridemountainpig",
            url: "https://www.github.com/ridemountainpig",
        },
    ],
    openGraph: {
        type: "website",
        url: "https://yencheng.dev/",
        title: "Yen Cheng Lin",
        description:
            "The personal website of Yen Cheng Lin, a software engineer and coffee enthusiast.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Yen Cheng Lin",
        description:
            "The personal website of Yen Cheng Lin, a software engineer and coffee enthusiast.",
        creator: "@ridemountainpig",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <Head>
                <meta
                    name="google-site-verification"
                    content="UmkdCtHuAz2VyuxgE8Th1jTiDJQccNGUEBivQ8d96Vc"
                />
            </Head>
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
