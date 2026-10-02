"use client";

import * as React from "react";
import { animate } from "framer-motion";

import {
    HOME_SCROLLER_ID,
    HOME_SECTION_LABELS,
    HOME_SECTIONS,
    type HomeSection,
} from "@/lib/home-sections";
import { cn } from "@/lib/utils";

/** A wheel pause longer than this ends the gesture. */
const GESTURE_GAP_MS = 180;
/** Wheel travel a gesture needs before it turns the page. */
const PAGE_THRESHOLD_PX = 24;
/**
 * A trackpad's momentum tail shrinks steadily, so a delta this many times the
 * last one, some time after the page turned, is a fresh swipe riding the tail.
 */
const FRESH_SWIPE_RATIO = 2;
const FRESH_SWIPE_MIN_PX = 15;
const FRESH_SWIPE_AFTER_MS = 300;

/** A wheel page turn carries the swipe on: quick start, soft landing. */
const WHEEL_EASE = [0.25, 1, 0.5, 1] as const;
const WHEEL_DURATION_S = 0.75;
/** A clicked jump moves content across the screen: ease in and out. */
const JUMP_EASE = [0.65, 0, 0.35, 1] as const;

function jumpDuration(sections: number) {
    return Math.min(0.55 + 0.15 * sections, 1.1);
}

type HomeScrollContextValue = {
    scrollToSection: (section: HomeSection) => void;
    scrollPrev: () => void;
    scrollNext: () => void;
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

/** The nearest element between target and page that can scroll by deltaY. */
function findInnerScroller(
    target: EventTarget | null,
    page: HTMLElement,
    deltaY: number,
) {
    let element = target instanceof Element ? target : null;

    while (element && element !== page) {
        if (
            element instanceof HTMLElement &&
            element.scrollHeight > element.clientHeight
        ) {
            const { overflowY } = getComputedStyle(element);
            const canScroll =
                deltaY > 0
                    ? element.scrollTop + element.clientHeight <
                      element.scrollHeight - 1
                    : element.scrollTop > 0;
            if ((overflowY === "auto" || overflowY === "scroll") && canScroll) {
                return element;
            }
        }
        element = element.parentElement;
    }

    return null;
}

interface HomeScrollerProps {
    /** Section the route points at; the page opens scrolled to it. */
    initialSection: HomeSection;
    /** Document title for each section, swapped in as it scrolls into view. */
    titles: Record<HomeSection, string>;
    children: React.ReactNode;
}

export default function HomeScroller({
    initialSection,
    titles,
    children,
}: HomeScrollerProps) {
    const scrollerRef = React.useRef<HTMLDivElement>(null);
    const [activeSection, setActiveSection] = React.useState(initialSection);
    const activeSectionRef = React.useRef(initialSection);
    const animationRef = React.useRef<ReturnType<typeof animate> | null>(null);
    /** Section index the running animation is heading to. */
    const targetIndexRef = React.useRef<number | null>(null);

    const getSectionElement = React.useCallback(
        (section: HomeSection) =>
            scrollerRef.current?.querySelector<HTMLElement>(
                `[data-home-section="${section}"]`,
            ) ?? null,
        [],
    );

    const syncLocation = React.useCallback(
        (section: HomeSection) => {
            const path = section === "home" ? "/" : `/${section}`;
            if (window.location.pathname !== path) {
                window.history.replaceState(null, "", path);
            }
            document.title = titles[section];
        },
        [titles],
    );

    const stopAnimation = React.useCallback(() => {
        animationRef.current?.stop();
        animationRef.current = null;
        targetIndexRef.current = null;
        scrollerRef.current?.style.removeProperty("scroll-snap-type");
    }, []);

    const goToIndex = React.useCallback(
        (index: number, motion: "wheel" | "jump") => {
            const scroller = scrollerRef.current;
            const section = HOME_SECTIONS[index];
            const target = section ? getSectionElement(section) : null;
            if (!scroller || !target) return;

            const from = scroller.scrollTop;
            const to = target.offsetTop;
            if (prefersReducedMotion() || from === to) {
                stopAnimation();
                scroller.scrollTop = to;
                return;
            }

            // Retargets a running animation from wherever it has got to.
            animationRef.current?.stop();
            targetIndexRef.current = index;
            // Snapping would pull each frame back to the nearest section.
            scroller.style.scrollSnapType = "none";
            animationRef.current = animate(from, to, {
                duration:
                    motion === "wheel"
                        ? WHEEL_DURATION_S
                        : jumpDuration(
                              Math.abs(to - from) / scroller.clientHeight,
                          ),
                ease: motion === "wheel" ? WHEEL_EASE : JUMP_EASE,
                onUpdate: (value) => {
                    scroller.scrollTop = value;
                },
                onComplete: () => {
                    animationRef.current = null;
                    targetIndexRef.current = null;
                    scroller.style.removeProperty("scroll-snap-type");
                    syncLocation(section);
                },
            });
        },
        [getSectionElement, stopAnimation, syncLocation],
    );

    const step = React.useCallback(
        (direction: 1 | -1, motion: "wheel" | "jump") => {
            const scroller = scrollerRef.current;
            if (!scroller) return;

            // Chained turns count from where the running one will land.
            const current =
                targetIndexRef.current ??
                Math.round(scroller.scrollTop / scroller.clientHeight);
            const next = current + direction;
            if (next >= 0 && next < HOME_SECTIONS.length) {
                goToIndex(next, motion);
            }
        },
        [goToIndex],
    );

    const scrollToSection = React.useCallback(
        (section: HomeSection) =>
            goToIndex(HOME_SECTIONS.indexOf(section), "jump"),
        [goToIndex],
    );

    const contextValue = React.useMemo(
        () => ({
            scrollToSection,
            scrollPrev: () => step(-1, "jump"),
            scrollNext: () => step(1, "jump"),
        }),
        [scrollToSection, step],
    );

    React.useLayoutEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        // The inline script in the page normally lands a deep link before
        // first paint; this covers the case where it did not run.
        const target = getSectionElement(initialSection);
        if (target && scroller.scrollTop === 0) {
            scroller.scrollTop = target.offsetTop;
        }

        // Arrow keys, Space and Page Up/Down scroll the focused scroller.
        scroller.focus({ preventScroll: true });
    }, [initialSection, getSectionElement]);

    React.useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        // Wheel and trackpad turn one page per gesture with our own easing;
        // touch and keyboard keep native scroll snapping.
        const gesture = {
            lastTime: -Infinity,
            lastSize: 0,
            mode: "page" as "page" | "inner",
            distance: 0,
            turnedAt: null as number | null,
        };

        const onWheel = (event: WheelEvent) => {
            // Pinch-zoom, or the travel map zooming on ⌘/Ctrl + scroll.
            if (event.ctrlKey || event.defaultPrevented) return;
            if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
            if (
                event.target instanceof Element &&
                event.target.closest("dialog")
            ) {
                return;
            }

            const deltaY =
                event.deltaMode === WheelEvent.DOM_DELTA_LINE
                    ? event.deltaY * 16
                    : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
                      ? event.deltaY * scroller.clientHeight
                      : event.deltaY;
            const size = Math.abs(deltaY);
            const freshSwipe =
                gesture.turnedAt !== null &&
                event.timeStamp - gesture.turnedAt > FRESH_SWIPE_AFTER_MS &&
                size > FRESH_SWIPE_MIN_PX &&
                size > gesture.lastSize * FRESH_SWIPE_RATIO;

            if (
                event.timeStamp - gesture.lastTime > GESTURE_GAP_MS ||
                freshSwipe
            ) {
                // Like native scroll latching, a whole gesture goes to one
                // place: a list that can still scroll that way, or the page.
                gesture.mode =
                    animationRef.current === null &&
                    findInnerScroller(event.target, scroller, deltaY)
                        ? "inner"
                        : "page";
                gesture.distance = 0;
                gesture.turnedAt = null;
            }
            gesture.lastTime = event.timeStamp;
            gesture.lastSize = size;

            if (gesture.mode === "inner") {
                // Stop at the list's edge rather than chain into the page.
                if (!findInnerScroller(event.target, scroller, deltaY)) {
                    event.preventDefault();
                }
                return;
            }

            event.preventDefault();
            if (gesture.turnedAt !== null) return;

            gesture.distance += deltaY;
            if (Math.abs(gesture.distance) >= PAGE_THRESHOLD_PX) {
                gesture.turnedAt = event.timeStamp;
                step(gesture.distance > 0 ? 1 : -1, "wheel");
            }
        };

        // Grabbing the page or pressing a key hands control back to native
        // scrolling, which snaps from wherever the animation got to.
        const interrupt = () => {
            if (animationRef.current !== null) {
                stopAnimation();
                syncLocation(activeSectionRef.current);
            }
        };

        scroller.addEventListener("wheel", onWheel, { passive: false });
        scroller.addEventListener("touchstart", interrupt, { passive: true });
        scroller.addEventListener("keydown", interrupt);

        return () => {
            scroller.removeEventListener("wheel", onWheel);
            scroller.removeEventListener("touchstart", interrupt);
            scroller.removeEventListener("keydown", interrupt);
            stopAnimation();
        };
    }, [step, stopAnimation, syncLocation]);

    React.useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.intersectionRatio >= 0.5) {
                        const section = (entry.target as HTMLElement).dataset
                            .homeSection as HomeSection;
                        activeSectionRef.current = section;
                        setActiveSection(section);
                    }
                }
            },
            { root: scroller, threshold: 0.5 },
        );

        scroller
            .querySelectorAll("[data-home-section]")
            .forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    React.useEffect(() => {
        // Mid-animation the URL waits for the landing, so a long jump does
        // not rewrite history for every section it passes.
        if (animationRef.current === null) {
            syncLocation(activeSection);
        }
    }, [activeSection, syncLocation]);

    return (
        <HomeScrollContext.Provider value={contextValue}>
            <div
                ref={scrollerRef}
                id={HOME_SCROLLER_ID}
                tabIndex={-1}
                className="no-scrollbar relative h-dvh snap-y snap-mandatory overflow-y-auto outline-none"
            >
                {children}
                <SectionNav
                    activeSection={activeSection}
                    onSelect={scrollToSection}
                />
            </div>
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
            className={cn(
                // overflow-clip, unlike overflow-hidden, cannot be scrolled by
                // scrollIntoView calls from inside the section.
                "relative h-full snap-start snap-always overflow-clip",
                className,
            )}
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
