"use client";

import Link from "next/link";

import { useHomeScroll } from "@/components/home-scroller";
import { MENU_TRIGGER_ID, SECTION_MENU_ID } from "@/components/section-menu";
import { SOCIAL_LINKS } from "@/lib/socials";
import { cn } from "@/lib/utils";

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

/**
 * Backdrop blurs that fade out sooner the stronger they are, so content
 * softens gradually as it slides under the header instead of meeting an edge.
 */
const BLUR_STEPS = [
    { blur: 1, fadeAt: 100 },
    { blur: 3, fadeAt: 70 },
    { blur: 6, fadeAt: 45 },
];

function TopBlur() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 top-0 z-30 h-24 sm:h-28"
        >
            {BLUR_STEPS.map(({ blur, fadeAt }) => {
                const mask = `linear-gradient(to bottom, black, transparent ${fadeAt}%)`;
                return (
                    <div
                        key={blur}
                        className="absolute inset-0"
                        style={{
                            backdropFilter: `blur(${blur}px)`,
                            WebkitBackdropFilter: `blur(${blur}px)`,
                            maskImage: mask,
                            WebkitMaskImage: mask,
                        }}
                    />
                );
            })}
            <div className="from-white-black-50 via-white-black-50/70 absolute inset-0 bg-linear-to-b to-transparent" />
        </div>
    );
}

export default function Header() {
    const { scrollToSection, activeSection, menuOpen, toggleMenu } =
        useHomeScroll();
    // The contact section lists the same links, so the header drops its
    // icons there.
    const atContact = activeSection === "footer";
    const hideSocials = menuOpen || atContact;

    return (
        <>
            <TopBlur />
            {/* Sits above the menu too, so its menu button becomes the close
                button. Only the controls catch clicks. */}
            <header className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex h-fit items-center justify-between px-2 py-3 sm:px-6 sm:py-4">
                <h1 className="pointer-events-auto">
                    <button
                        type="button"
                        onClick={() => scrollToSection("home")}
                        className="bg-white-brown-500 font-nunito text-white-brown-800 cursor-pointer rounded-xl p-2 px-3 sm:text-2xl"
                    >
                        Yen Cheng Lin
                    </button>
                </h1>
                <div className="text-white-black-900 pointer-events-auto flex h-fit items-center gap-x-2">
                    {/* Phones find these in the menu instead */}
                    <div
                        inert={hideSocials}
                        className={cn(
                            "hidden items-center gap-x-2 transition-opacity duration-300 sm:flex",
                            hideSocials && "opacity-0",
                        )}
                    >
                        {SOCIAL_LINKS.map(({ href, label, Icon, filled }) => (
                            <Link
                                key={href}
                                href={href}
                                title={label}
                                className="bg-white-brown-500 text-white-brown-800 rounded-xl p-2"
                            >
                                <Icon
                                    strokeWidth={2.25}
                                    className={cn(
                                        "size-[30px]",
                                        filled &&
                                            "[&_path]:fill-white-brown-800",
                                    )}
                                />
                            </Link>
                        ))}
                    </div>
                    <button
                        id={MENU_TRIGGER_ID}
                        type="button"
                        onClick={toggleMenu}
                        aria-label="Menu"
                        aria-expanded={menuOpen}
                        aria-controls={SECTION_MENU_ID}
                        className="bg-white-brown-500 text-white-brown-800 cursor-pointer rounded-xl p-2 transition-transform duration-150 ease-out active:scale-95"
                    >
                        {/* Two bars that cross into an X */}
                        <span
                            aria-hidden="true"
                            className="relative block size-[25px] sm:size-[30px]"
                        >
                            {[-1, 1].map((side) => (
                                <span
                                    key={side}
                                    className={cn(
                                        "absolute inset-x-[3px] top-1/2 -mt-px h-[2.5px] rounded-full bg-current transition-[rotate,translate] duration-500 motion-reduce:transition-none",
                                        EASE,
                                        menuOpen
                                            ? side < 0
                                                ? "rotate-45"
                                                : "-rotate-45"
                                            : side < 0
                                              ? "-translate-y-[4px]"
                                              : "translate-y-[4px]",
                                    )}
                                />
                            ))}
                        </span>
                    </button>
                </div>
            </header>
        </>
    );
}
