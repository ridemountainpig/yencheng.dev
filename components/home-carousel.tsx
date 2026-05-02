"use client";

import * as React from "react";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { usePathname } from "next/navigation";

import { Carousel, CarouselContent } from "@/components/ui/carousel";
import {
    getHomeSectionIndexFromQuery,
    getHomeSectionFromIndex,
} from "@/lib/home-sections";

type CarouselApi = UseEmblaCarouselType[1];

interface HomeCarouselProps {
    children: React.ReactNode;
}

export default function HomeCarousel({ children }: HomeCarouselProps) {
    const pathname = usePathname();
    const [api, setApi] = React.useState<CarouselApi | null>(null);

    const handleSetApi = React.useCallback((nextApi: CarouselApi) => {
        setApi(nextApi ?? null);
    }, []);

    const initialIndex = React.useMemo(() => {
        const slug = !pathname || pathname === "/" ? "" : pathname.slice(1);
        return getHomeSectionIndexFromQuery(slug);
    }, [pathname]);

    const carouselOptions = React.useMemo(
        () => ({ startIndex: initialIndex }),
        [initialIndex],
    );

    React.useEffect(() => {
        if (!api) return;

        const onSelect = () => {
            const index = api.selectedScrollSnap();
            const section = getHomeSectionFromIndex(index);
            const newPath = section === "home" ? "/" : `/${section}`;
            window.history.replaceState(null, "", newPath);
        };

        api.on("select", onSelect);
        return () => {
            api.off("select", onSelect);
        };
    }, [api]);

    return (
        <Carousel opts={carouselOptions} setApi={handleSetApi}>
            <CarouselContent>{children}</CarouselContent>
        </Carousel>
    );
}
