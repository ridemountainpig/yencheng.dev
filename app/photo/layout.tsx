import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Photo Gallery",
    description:
        "A collection of travel and life photos by Yen Cheng Lin, exploring places around the world with a camera in hand.",
    alternates: {
        canonical: "https://yencheng.dev/photo",
    },
    openGraph: {
        title: "Photo Gallery — Yen Cheng Lin",
        description:
            "A collection of travel and life photos by Yen Cheng Lin, exploring places around the world with a camera in hand.",
        url: "https://yencheng.dev/photo",
    },
    twitter: {
        title: "Photo Gallery — Yen Cheng Lin",
        description:
            "A collection of travel and life photos by Yen Cheng Lin, exploring places around the world with a camera in hand.",
    },
};

export default function PhotoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
