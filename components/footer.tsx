"use client";

import { Undo2 } from "lucide-react";
import { useHomeScroll } from "@/components/home-scroller";

export default function Footer() {
    const { scrollToSection } = useHomeScroll();

    return (
        <footer className="xs:text-lg font-nunito text-white-black-900 flex h-full flex-col items-center justify-center text-sm tracking-wider select-none md:text-xl">
            <h2>
                © {new Date().getFullYear()} Yen Cheng Lin. All rights reserved
            </h2>
            <button
                type="button"
                className="cursor-pointer pt-4"
                onClick={() => scrollToSection("home")}
                aria-label="Back to top"
            >
                <Undo2
                    strokeWidth={2.25}
                    size={30}
                    className="hidden sm:block"
                />
                <Undo2 strokeWidth={2.25} size={24} className="sm:hidden" />
            </button>
        </footer>
    );
}
