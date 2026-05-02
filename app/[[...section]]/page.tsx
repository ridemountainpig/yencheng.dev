import type { Metadata } from "next";
import { Suspense } from "react";

import Banner from "@/components/banner";
import Footer from "@/components/footer";
import Header from "@/components/header";
import HomeCarousel from "@/components/home-carousel";
import Portfolio from "@/components/portfolio";
import Raycast from "@/components/raycast";
import Travel from "@/components/travel";
import { CarouselItem } from "@/components/ui/carousel";
import { HOME_SECTIONS } from "@/lib/home-sections";

interface PageProps {
    params: Promise<{ section?: string[] }>;
}

const SECTION_METADATA: Record<string, Metadata> = {
    portfolio: {
        title: "Portfolio",
        description:
            "Explore the portfolio of Yen Cheng Lin — open-source projects, Raycast extensions, and web apps built with Next.js and modern technologies.",
        alternates: {
            canonical: "https://yencheng.dev/portfolio",
        },
        openGraph: {
            title: "Portfolio — Yen Cheng Lin",
            description:
                "Open-source projects, Raycast extensions, and web apps built with Next.js.",
            url: "https://yencheng.dev/portfolio",
        },
    },
    travel: {
        title: "Travel",
        description:
            "Travel map and flight history of Yen Cheng Lin — places visited and routes around the world.",
        alternates: {
            canonical: "https://yencheng.dev/travel",
        },
        openGraph: {
            title: "Travel — Yen Cheng Lin",
            description:
                "Travel map and flight history — places visited and routes around the world.",
            url: "https://yencheng.dev/travel",
        },
    },
    raycast: {
        title: "Raycast Extensions",
        description:
            "Raycast extensions built and published by Yen Cheng Lin, a Raycast Ambassador from Taiwan.",
        alternates: {
            canonical: "https://yencheng.dev/raycast",
        },
        openGraph: {
            title: "Raycast Extensions — Yen Cheng Lin",
            description:
                "Raycast extensions built and published by Yen Cheng Lin, a Raycast Ambassador from Taiwan.",
            url: "https://yencheng.dev/raycast",
        },
    },
    footer: {
        title: "Contact",
        description:
            "Get in touch with Yen Cheng Lin — find links to GitHub, LinkedIn, Twitter, and more.",
        robots: {
            index: false,
        },
    },
};

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { section } = await params;
    const slug = section?.[0];
    return SECTION_METADATA[slug ?? ""] ?? {};
}

export function generateStaticParams() {
    return HOME_SECTIONS.map((section) => ({
        section: section === "home" ? [] : [section],
    }));
}

export default function Home() {
    return (
        <main className="h-screen w-full overflow-hidden">
            <Suspense fallback={null}>
                <HomeCarousel>
                    <CarouselItem>
                        <Header></Header>
                        <Banner></Banner>
                    </CarouselItem>
                    <CarouselItem>
                        <Portfolio></Portfolio>
                    </CarouselItem>
                    <CarouselItem className="flex h-screen max-h-screen flex-col overflow-hidden">
                        <Travel></Travel>
                    </CarouselItem>
                    <CarouselItem>
                        <Raycast></Raycast>
                    </CarouselItem>
                    <CarouselItem>
                        <Footer></Footer>
                    </CarouselItem>
                </HomeCarousel>
            </Suspense>
        </main>
    );
}
