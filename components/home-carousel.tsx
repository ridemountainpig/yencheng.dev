"use client";

import * as React from "react";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { useSearchParams } from "next/navigation";

import { Carousel, CarouselContent } from "@/components/ui/carousel";
import {
    getHomeSectionIndexFromQuery,
    HOME_SECTION_QUERY_PARAM,
} from "@/lib/home-sections";

type CarouselApi = UseEmblaCarouselType[1];

interface HomeCarouselProps {
    children: React.ReactNode;
}

export default function HomeCarousel({ children }: HomeCarouselProps) {
    const searchParams = useSearchParams();
    const [api, setApi] = React.useState<CarouselApi | null>(null);
    const handleSetApi = React.useCallback((nextApi: CarouselApi) => {
        setApi(nextApi ?? null);
    }, []);
    const targetIndex = React.useMemo(() => {
        const sectionParam =
            searchParams?.get(HOME_SECTION_QUERY_PARAM) ?? undefined;
        const slideParam = searchParams?.get("slide") ?? undefined;

        return getHomeSectionIndexFromQuery(sectionParam ?? slideParam);
    }, [searchParams]);
    const carouselOptions = React.useMemo(
        () => ({ startIndex: targetIndex }),
        [targetIndex],
    );

    React.useEffect(() => {
        if (!api) {
            return;
        }

        if (api.selectedScrollSnap() === targetIndex) {
            return;
        }

        api.scrollTo(targetIndex, true);
    }, [api, targetIndex]);

    return (
        <Carousel opts={carouselOptions} setApi={handleSetApi}>
            <CarouselContent>{children}</CarouselContent>
        </Carousel>
    );
}
