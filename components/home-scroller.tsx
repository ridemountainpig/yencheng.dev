"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import {
    HOME_SECTION_LABELS,
    HOME_SECTIONS,
    type HomeSection,
} from "@/lib/home-sections";
import { cn } from "@/lib/utils";
import SectionMenu, { MENU_TRIGGER_ID } from "@/components/section-menu";

/** A section becomes current once its top passes this share of the viewport. */
const ACTIVE_LINE = 0.4;

type HomeScrollContextValue = {
    scrollToSection: (section: HomeSection) => void;
    activeSection: HomeSection;
    menuOpen: boolean;
    toggleMenu: () => void;
};

const HomeScrollContext = React.createContext<HomeScrollContextValue | null>(
    null,
);

export function useHomeScroll() {
    const context = React.useContext(HomeScrollContext);

    if (!context) {
        throw new Error("useHomeScroll must be used within <HomeScroller />");
    }

    return context;
}

function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getSectionElement(section: HomeSection) {
    return document.querySelector<HTMLElement>(
        `[data-home-section="${section}"]`,
    );
}

interface HomeScrollerProps {
    /** Section the route points at; the page opens scrolled to it. */
    initialSection: HomeSection;
    /** Document title for each section, swapped in as it scrolls into view. */
    titles: Record<HomeSection, string>;
    children: React.ReactNode;
}

/**
 * Tracks which home section is being read as the page scrolls, keeps the
 * URL and title in step with it, and hosts the section menu.
 */
export default function HomeScroller({
    initialSection,
    titles,
    children,
}: HomeScrollerProps) {
    const [activeSection, setActiveSection] = React.useState(initialSection);
    const [menuOpen, setMenuOpen] = React.useState(false);

    const scrollToSection = React.useCallback((section: HomeSection) => {
        getSectionElement(section)?.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start",
        });
    }, []);

    const toggleMenu = React.useCallback(
        () => setMenuOpen((open) => !open),
        [],
    );

    const closeMenu = React.useCallback(() => {
        setMenuOpen(false);
        document
            .getElementById(MENU_TRIGGER_ID)
            ?.focus({ preventScroll: true });
    }, []);

    const selectFromMenu = React.useCallback(
        (section: HomeSection) => {
            setMenuOpen(false);
            // Scroll once the page is unlocked, and let keyboard users carry
            // on from the section they jumped to.
            requestAnimationFrame(() => {
                scrollToSection(section);
                getSectionElement(section)?.focus({ preventScroll: true });
            });
        },
        [scrollToSection],
    );

    const contextValue = React.useMemo(
        () => ({ scrollToSection, activeSection, menuOpen, toggleMenu }),
        [scrollToSection, activeSection, menuOpen, toggleMenu],
    );

    React.useLayoutEffect(() => {
        // The inline script in the page normally lands a deep link before
        // first paint; this covers the case where it did not run.
        if (initialSection !== "home" && window.scrollY === 0) {
            getSectionElement(initialSection)?.scrollIntoView();
        }
    }, [initialSection]);

    React.useEffect(() => {
        /** How far the current section had scrolled, as a share of its height. */
        let anchor: { section: HomeSection; progress: number } | null = null;
        let frame = 0;
        const update = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const line = window.innerHeight * ACTIVE_LINE;
                let current: HomeSection = HOME_SECTIONS[0];
                let currentRect: DOMRect | undefined;
                for (const section of HOME_SECTIONS) {
                    const rect =
                        getSectionElement(section)?.getBoundingClientRect();
                    if (rect && rect.top <= line) {
                        current = section;
                        currentRect = rect;
                    }
                }
                anchor = currentRect
                    ? {
                          section: current,
                          progress: -currentRect.top / currentRect.height,
                      }
                    : null;
                setActiveSection(current);
            });
        };

        // Sections are sized in viewport units, so a height change resizes
        // every one of them, which also switches off the browser's scroll
        // anchoring. Without this, the sections above grow and push the one
        // being read off screen.
        const reanchor = () => {
            if (anchor) {
                const rect = getSectionElement(
                    anchor.section,
                )?.getBoundingClientRect();
                const drift = rect
                    ? rect.top + anchor.progress * rect.height
                    : 0;
                if (Math.abs(drift) >= 1) {
                    window.scrollTo({
                        top: window.scrollY + drift,
                        behavior: "instant",
                    });
                }
            }
            update();
        };

        update();
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", reanchor);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", reanchor);
        };
    }, []);

    React.useEffect(() => {
        const path = activeSection === "home" ? "/" : `/${activeSection}`;
        if (window.location.pathname !== path) {
            window.history.replaceState(null, "", path);
        }
    }, [activeSection]);

    // Next answers replaceState by re-rendering, which can put the route's
    // own <title> back in the head, so set the title again once the new
    // pathname has committed.
    const pathname = usePathname();
    React.useEffect(() => {
        document.title = titles[activeSection];
    }, [activeSection, pathname, titles]);

    React.useEffect(() => {
        if (!menuOpen) return;

        const root = document.documentElement;
        const { overflow, scrollbarGutter } = root.style;
        // Lock the page behind the menu, keeping the scrollbar's space so
        // nothing shifts sideways.
        if (window.innerWidth > root.clientWidth) {
            root.style.scrollbarGutter = "stable";
        }
        root.style.overflow = "hidden";
        return () => {
            root.style.overflow = overflow;
            root.style.scrollbarGutter = scrollbarGutter;
        };
    }, [menuOpen]);

    return (
        <HomeScrollContext.Provider value={contextValue}>
            {children}
            <SectionNav
                activeSection={activeSection}
                onSelect={scrollToSection}
            />
            <SectionMenu
                open={menuOpen}
                activeSection={activeSection}
                onClose={closeMenu}
                onSelect={selectFromMenu}
            />
        </HomeScrollContext.Provider>
    );
}

interface HomeScrollSectionProps extends React.HTMLAttributes<HTMLElement> {
    section: HomeSection;
}

export function HomeScrollSection({
    section,
    className,
    ...props
}: HomeScrollSectionProps) {
    return (
        <section
            data-home-section={section}
            aria-label={HOME_SECTION_LABELS[section]}
            // Focusable so a menu jump can hand keyboard focus to it.
            tabIndex={-1}
            // At least a screen tall, so each section reads as its own page.
            className={cn("relative min-h-dvh outline-none", className)}
            {...props}
        />
    );
}

function SectionNav({
    activeSection,
    onSelect,
}: {
    activeSection: HomeSection;
    onSelect: (section: HomeSection) => void;
}) {
    return (
        <nav
            aria-label="Sections"
            className="fixed top-1/2 right-0 z-40 hidden -translate-y-1/2 flex-col items-end sm:flex"
        >
            {HOME_SECTIONS.map((section) => {
                const active = section === activeSection;

                return (
                    <button
                        key={section}
                        type="button"
                        onClick={() => onSelect(section)}
                        aria-label={HOME_SECTION_LABELS[section]}
                        aria-current={active ? "true" : undefined}
                        className="group flex cursor-pointer items-center gap-2 px-1.5 py-1.5 outline-none"
                    >
                        <span
                            aria-hidden="true"
                            className="bg-white-brown-500 text-white-brown-800 font-nunito pointer-events-none translate-x-1 rounded-lg px-2 py-0.5 text-xs tracking-wide whitespace-nowrap opacity-0 transition duration-150 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
                        >
                            {HOME_SECTION_LABELS[section]}
                        </span>
                        <span
                            aria-hidden="true"
                            className={cn(
                                "group-focus-visible:ring-white-brown-700 w-1.5 rounded-full ring-offset-2 transition-[height,background-color] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-focus-visible:ring-2 motion-reduce:transition-none",
                                active
                                    ? "bg-white-brown-800 h-5"
                                    : "bg-white-brown-600 group-hover:bg-white-brown-700 h-1.5",
                            )}
                        />
                    </button>
                );
            })}
        </nav>
    );
}
