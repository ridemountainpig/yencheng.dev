"use client";

import { CircleArrowLeft, CircleArrowRight } from "lucide-react";
import { useCarousel } from "@/components/ui/carousel";
import Title from "@/components/title";

interface PageTitleProps {
    title: string;
}

export default function PageTitle({ title }: PageTitleProps) {
    const { scrollPrev, scrollNext } = useCarousel();

    return (
        <div className="flex h-fit items-center justify-between px-4 sm:px-8">
            <div className="cursor-pointer" onClick={scrollPrev}>
                <CircleArrowLeft
                    strokeWidth={2.25}
                    size={36}
                    className="hidden sm:block"
                />
                <CircleArrowLeft
                    strokeWidth={2.25}
                    size={25}
                    className="sm:hidden"
                />
            </div>
            <Title title={title}></Title>
            <div className="cursor-pointer" onClick={scrollNext}>
                <CircleArrowRight
                    strokeWidth={2.25}
                    size={36}
                    className="hidden sm:block"
                />
                <CircleArrowRight
                    strokeWidth={2.25}
                    size={25}
                    className="sm:hidden"
                />
            </div>
        </div>
    );
}
