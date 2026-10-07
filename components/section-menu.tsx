"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
    HOME_SECTION_LABELS,
    HOME_SECTIONS,
    type HomeSection,
} from "@/lib/home-sections";
import { BLOG_URL, SOCIAL_LINKS } from "@/lib/socials";
import { cn } from "@/lib/utils";

// The blog gets its own text link in the menu, so the icons skip it.
const SOCIAL_ICONS = SOCIAL_LINKS.filter(({ href }) => href !== BLOG_URL);

export const SECTION_MENU_ID = "section-menu";
/** The header's menu button, which stays above the menu as its close button. */
export const MENU_TRIGGER_ID = "section-menu-trigger";

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

/** Rows rise in one after another on open, and leave together on close. */
function rowStyle(open: boolean, index: number): React.CSSProperties {
    return { transitionDelay: open ? `${80 + index * 40}ms` : "0ms" };
}

function rowClassName(open: boolean) {
    return cn(
        "transition-[opacity,translate,filter] motion-reduce:transition-none",
        EASE,
        open
            ? "translate-y-0 opacity-100 blur-[0px] duration-700"
            : "translate-y-6 opacity-0 blur-sm duration-300",
    );
}

interface SectionMenuProps {
    open: boolean;
    activeSection: HomeSection;
    onClose: () => void;
    onSelect: (section: HomeSection) => void;
}

/** Full-screen section index, opened from the header's menu button. */
export default function SectionMenu({
    open,
    activeSection,
    onClose,
    onSelect,
}: SectionMenuProps) {
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!open) return;
        const menu = menuRef.current;
        if (!menu) return;

        menu.querySelector<HTMLElement>("[aria-current]")?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
                return;
            }
            if (event.key !== "Tab") return;

            // Keep Tab cycling between the menu button and the menu while it
            // covers the page. The button sits outside the menu in the DOM,
            // so step through them by hand.
            const focusables = [
                document.getElementById(MENU_TRIGGER_ID),
                ...menu.querySelectorAll<HTMLElement>("button, a[href]"),
            ].filter((element): element is HTMLElement => element !== null);
            if (focusables.length === 0) return;
            event.preventDefault();
            const index = focusables.indexOf(
                document.activeElement as HTMLElement,
            );
            const step = event.shiftKey ? -1 : 1;
            const next =
                index === -1
                    ? 0
                    : (index + step + focusables.length) % focusables.length;
            focusables[next].focus();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    return (
        <div
            ref={menuRef}
            id={SECTION_MENU_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Sections"
            inert={!open}
            onClick={onClose}
            className={cn(
                "bg-white-black-50/80 fixed inset-0 z-50 overflow-y-auto overscroll-contain backdrop-blur-2xl motion-reduce:transition-none",
                EASE,
                // Visibility flips at once on open, so focus can land inside
                // straight away, and waits for the fade on close.
                open
                    ? "visible opacity-100 transition-opacity duration-500"
                    : "invisible opacity-0 transition-[opacity,visibility] duration-300",
            )}
        >
            <div className="flex min-h-full flex-col px-5 pt-24 pb-8 sm:px-12 sm:pt-32 sm:pb-12">
                <nav aria-label="Jump to section">
                    <ul className="group/list flex w-fit flex-col">
                        {HOME_SECTIONS.map((section, index) => {
                            const active = section === activeSection;

                            return (
                                <li
                                    key={section}
                                    className={rowClassName(open)}
                                    style={rowStyle(open, index)}
                                >
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onSelect(section);
                                        }}
                                        aria-current={
                                            active ? "true" : undefined
                                        }
                                        className="group text-white-black-900 sm:group-hover/list:text-white-black-300 sm:hover:text-white-black-900! flex w-fit cursor-pointer items-start gap-4 rounded-lg py-1.5 text-left transition-colors duration-300 sm:gap-6"
                                    >
                                        <span className="text-white-brown-700 mt-1 font-mono text-xs tabular-nums sm:mt-1.5">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <span
                                            className={cn(
                                                "font-nunito relative text-4xl leading-[1.15] tracking-wide transition-[translate] duration-500 group-hover:translate-x-1.5 motion-reduce:transition-none sm:text-5xl",
                                                EASE,
                                            )}
                                        >
                                            {active && (
                                                <span
                                                    aria-hidden="true"
                                                    className="bg-white-brown-600 absolute bottom-1 left-0 h-3 w-full opacity-90 sm:h-4"
                                                />
                                            )}
                                            <span className="relative">
                                                {HOME_SECTION_LABELS[section]}
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div
                    className={cn(
                        "font-nunito text-white-black-900 mt-auto flex items-center justify-between pt-12",
                        rowClassName(open),
                    )}
                    style={rowStyle(open, HOME_SECTIONS.length)}
                >
                    <Link
                        href={BLOG_URL}
                        target="_blank"
                        className="group flex items-center gap-1 text-lg tracking-wide sm:text-xl"
                    >
                        Blog
                        <ArrowUpRight
                            strokeWidth={2.25}
                            className="size-5 transition-[translate] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                    </Link>
                    <div className="flex items-center gap-x-2">
                        {SOCIAL_ICONS.map(({ href, label, Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                target="_blank"
                                aria-label={label}
                                className="bg-white-brown-500 rounded-xl p-2"
                            >
                                <Icon className="[&_path]:fill-white-brown-800 size-[22px]" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
