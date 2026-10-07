"use client";

import { Undo2 } from "lucide-react";
import { useHomeScroll } from "@/components/home-scroller";
import Title from "@/components/title";
import { SOCIAL_LINKS } from "@/lib/socials";
import { cn } from "@/lib/utils";

export default function Footer() {
    const { scrollToSection } = useHomeScroll();

    return (
        <footer className="font-nunito text-white-black-900 relative flex min-h-dvh flex-col items-center justify-center px-6 pt-20 pb-28 text-center tracking-wider sm:pt-24">
            <Title title="Get in Touch" as="h2"></Title>
            <p className="text-white-black-700 mt-5 max-w-md text-sm leading-relaxed text-balance sm:text-base">
                <span className="block">
                    Have a question, an idea, or just want to say hi?
                </span>
                <span className="block">Feel free to reach out.</span>
            </p>

            {/* Two by two on phones, where four in a row would wrap unevenly */}
            <ul className="mt-8 grid w-full max-w-xs grid-cols-2 gap-2 sm:flex sm:w-auto sm:max-w-none sm:justify-center">
                {SOCIAL_LINKS.map(({ label, href, Icon, filled }) => (
                    <li key={href}>
                        <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white-brown-500 text-white-brown-800 hover:bg-white-brown-600 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm transition-[background-color,scale] duration-200 ease-out active:scale-[0.97] sm:text-base"
                        >
                            <Icon
                                strokeWidth={2.25}
                                className={cn(
                                    "size-[18px]",
                                    filled && "[&_path]:fill-white-brown-800",
                                )}
                            />
                            {label}
                        </a>
                    </li>
                ))}
            </ul>

            <div className="text-white-black-500 absolute inset-x-0 bottom-6 flex flex-col items-center gap-3 px-6 text-xs">
                <button
                    type="button"
                    className="hover:text-white-black-900 cursor-pointer transition-colors duration-200"
                    onClick={() => scrollToSection("home")}
                    aria-label="Back to top"
                >
                    <Undo2 strokeWidth={2.25} size={22} />
                </button>
                <p>
                    © {new Date().getFullYear()} Yen Cheng Lin. All rights
                    reserved
                </p>
            </div>
        </footer>
    );
}
