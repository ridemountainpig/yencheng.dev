"use client";

import { CircleArrowDown, CircleArrowUp } from "lucide-react";
import { useHomeScroll } from "@/components/home-scroller";
import Title from "@/components/title";

interface PageTitleProps {
    title: string;
}

export default function PageTitle({ title }: PageTitleProps) {
    const { scrollPrev, scrollNext } = useHomeScroll();

    // Phones get prev/next arrows: the section nav is hidden there, and long
    // sections would otherwise have to be scrolled through to move on.
    return (
        <div className="flex h-fit items-center justify-between px-4 sm:justify-center sm:px-8">
            <button
                type="button"
                className="cursor-pointer sm:hidden"
                onClick={scrollPrev}
                aria-label="Previous section"
            >
                <CircleArrowUp strokeWidth={2.25} size={25} />
            </button>
            <Title title={title} as="h2"></Title>
            <button
                type="button"
                className="cursor-pointer sm:hidden"
                onClick={scrollNext}
                aria-label="Next section"
            >
                <CircleArrowDown strokeWidth={2.25} size={25} />
            </button>
        </div>
    );
}
