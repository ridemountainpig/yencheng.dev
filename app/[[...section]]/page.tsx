import type { Metadata } from "next";

import Banner from "@/components/banner";
import Footer from "@/components/footer";
import Header from "@/components/header";
import HomeScroller, { HomeScrollSection } from "@/components/home-scroller";
import Live from "@/components/live";
import Portfolio from "@/components/portfolio";
import Raycast from "@/components/raycast";
import Travel from "@/components/travel";
import {
    getHomeSectionFromIndex,
    getHomeSectionIndexFromQuery,
    HOME_SCROLLER_ID,
    HOME_SECTIONS,
    type HomeSection,
} from "@/lib/home-sections";

interface PageProps {
    params: Promise<{ section?: string[] }>;
}

export const dynamicParams = false;

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
    live: {
        title: "Live Shows",
        description:
            "A timeline and interactive Taiwan venue map of live shows attended by Yen Cheng Lin.",
        alternates: {
            canonical: "https://yencheng.dev/live",
        },
        openGraph: {
            title: "Live Shows — Yen Cheng Lin",
            description:
                "Live show memories organized by date and venue across Taiwan.",
            url: "https://yencheng.dev/live",
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

const HOME_TITLE = "Yen Cheng Lin — Full-Stack Developer & Raycast Ambassador";

/** Mirrors the layout's "%s — Yen Cheng Lin" template for client-side swaps. */
const SECTION_TITLES = Object.fromEntries(
    HOME_SECTIONS.map((section) => {
        const title = SECTION_METADATA[section]?.title;
        return [
            section,
            typeof title === "string" ? `${title} — Yen Cheng Lin` : HOME_TITLE,
        ];
    }),
) as Record<HomeSection, string>;

/** Scrolls a deep-linked section into place before first paint. */
function initialScrollScript(section: HomeSection) {
    return `(()=>{const s=document.getElementById("${HOME_SCROLLER_ID}");const t=s&&s.querySelector('[data-home-section="${section}"]');if(t)s.scrollTop=t.offsetTop})()`;
}

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

export default async function Home({ params }: PageProps) {
    const { section } = await params;
    const initialSection = getHomeSectionFromIndex(
        getHomeSectionIndexFromQuery(section?.[0]),
    );

    return (
        <main className="w-full">
            <HomeScroller
                initialSection={initialSection}
                titles={SECTION_TITLES}
            >
                <HomeScrollSection section="home">
                    <Header></Header>
                    <Banner></Banner>
                </HomeScrollSection>
                <HomeScrollSection section="portfolio">
                    <Portfolio></Portfolio>
                </HomeScrollSection>
                <HomeScrollSection section="travel">
                    <Travel></Travel>
                </HomeScrollSection>
                <HomeScrollSection section="live">
                    <Live />
                </HomeScrollSection>
                <HomeScrollSection section="raycast">
                    <Raycast></Raycast>
                </HomeScrollSection>
                <HomeScrollSection section="footer">
                    <Footer></Footer>
                </HomeScrollSection>
            </HomeScroller>
            {initialSection !== "home" && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: initialScrollScript(initialSection),
                    }}
                />
            )}
        </main>
    );
}
