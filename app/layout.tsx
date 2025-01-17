import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { Rwdot } from "rwdot";
import "./globals.css";

const genSenB = localFont({
    src: "./fonts/GenSenRounded2TW-B.otf",
    variable: "--font-gensenb",
    preload: true,
});

export const metadata: Metadata = {
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
        images: [
            {
                url: "https://yencheng.dev/favicon.ico",
                width: 1200,
                height: 630,
                alt: "Yen Cheng Lin",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Yen Cheng Lin",
        description:
            "The personal website of Yen Cheng Lin, a software engineer and coffee enthusiast.",
        creator: "@ridemountainpig",
        images: ["https://yencheng.dev/favicon.ico"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${genSenB.variable} bg-white-black-50 antialiased`}
            >
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
