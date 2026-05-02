import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Instagram Highlights",
    description:
        "Instagram highlights and reels by Yen Cheng Lin — moments from daily life, travel, and coffee adventures.",
    alternates: {
        canonical: "https://yencheng.dev/instagram",
    },
    openGraph: {
        title: "Instagram Highlights — Yen Cheng Lin",
        description:
            "Instagram highlights and reels by Yen Cheng Lin — moments from daily life, travel, and coffee adventures.",
        url: "https://yencheng.dev/instagram",
    },
    twitter: {
        title: "Instagram Highlights — Yen Cheng Lin",
        description:
            "Instagram highlights and reels by Yen Cheng Lin — moments from daily life, travel, and coffee adventures.",
    },
};

export default function InstagramLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
