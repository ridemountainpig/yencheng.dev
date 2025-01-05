import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { Rwdot } from "rwdot";
import "./globals.css";

const genSenB = localFont({
    src: "./fonts/GenSenRounded2TW-B.otf",
    variable: "--font-gensenb",
});

export const metadata: Metadata = {
    title: "Yen Cheng Lin",
    description: "The personal website of Yen Cheng Lin.",
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
