/* eslint-disable @next/next/no-img-element */
"use client";

import {
    Map,
    MapMarker,
    MarkerContent,
    MapPopup,
    MapControls,
    useMap,
} from "@/components/ui/map";
import { ChevronLeft, ChevronRight, Maximize } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import PhotoLightbox, { type Size } from "./photo-lightbox";
import images from "./images.json";

type ImageData = {
    paths: string[];
    description?: string;
    date?: string;
    latitude?: number;
    longitude?: number;
};

type FullscreenRequest = {
    data: ImageData;
    imageIndex: number;
    /** The popup card the photo zooms out of. */
    origin: HTMLElement | null;
    size?: Size;
    /** Points the popup at the photo the lightbox closed on. */
    syncIndex: (index: number) => void;
};

export default function PhotoPage() {
    const [fullscreen, setFullscreen] = useState<FullscreenRequest | null>(
        null,
    );

    const imagesWithLocation = (images as ImageData[]).filter(
        (image) => image.latitude && image.longitude,
    );

    return (
        <>
            <div className="h-screen overflow-hidden rounded-lg">
                <Map center={[120.76988332999102, 23.64478894511211]} zoom={4}>
                    <MapControls showZoom showFullscreen />
                    <PhotoMarkers
                        images={imagesWithLocation}
                        lightboxOpen={fullscreen !== null}
                        onFullscreen={setFullscreen}
                    />
                </Map>
            </div>

            {fullscreen && (
                <PhotoLightbox
                    image={fullscreen.data}
                    startIndex={fullscreen.imageIndex}
                    origin={fullscreen.origin}
                    startSize={fullscreen.size}
                    onIndexChange={fullscreen.syncIndex}
                    onClosed={() => setFullscreen(null)}
                />
            )}
        </>
    );
}

function PhotoMarkers({
    images,
    lightboxOpen,
    onFullscreen,
}: {
    images: ImageData[];
    lightboxOpen: boolean;
    onFullscreen: (request: FullscreenRequest) => void;
}) {
    const { map } = useMap();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [popupImageIndex, setPopupImageIndex] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMarkerClick = useCallback(
        (image: ImageData, index: number) => {
            if (!map) return;

            // Close any open popup first
            setActiveIndex(null);
            setPopupImageIndex(0);

            const container = map.getContainer();
            const height = container.clientHeight;

            const targetZoom = 8;
            const currentZoom = map.getZoom();

            map.flyTo({
                center: [image.longitude!, image.latitude!],
                zoom: currentZoom > targetZoom ? currentZoom : targetZoom,
                padding: { top: height / 2 },
                duration: 800,
            });

            // Open popup after fly animation completes
            map.once("moveend", () => {
                setActiveIndex(index);
            });
        },
        [map],
    );

    const handlePopupNav = (direction: "prev" | "next") => {
        if (activeIndex === null) return;
        const pathsLength = images[activeIndex].paths.length;
        setPopupImageIndex((prev) =>
            direction === "prev"
                ? (prev - 1 + pathsLength) % pathsLength
                : (prev + 1) % pathsLength,
        );
    };

    const activeImage = activeIndex !== null ? images[activeIndex] : null;

    return (
        <>
            {images.map((image, index) => (
                <MapMarker
                    key={index}
                    longitude={image.longitude!}
                    latitude={image.latitude!}
                    onClick={() => handleMarkerClick(image, index)}
                >
                    <MarkerContent>
                        <div className="size-8 cursor-pointer overflow-hidden rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110">
                            <img
                                src={"https://r2.yencheng.dev" + image.paths[0]}
                                alt={image.description || ""}
                                width={32}
                                height={32}
                                className="size-full object-cover"
                            />
                        </div>
                    </MarkerContent>
                </MapMarker>
            ))}

            {activeImage && (
                <MapPopup
                    longitude={activeImage.longitude!}
                    latitude={activeImage.latitude!}
                    onClose={() => {
                        setActiveIndex(null);
                        setPopupImageIndex(0);
                    }}
                    className="w-[300px] cursor-default border-0! bg-transparent! p-0! shadow-none! focus:outline-none"
                >
                    {/* Hidden while the lightbox flies the photo out of it */}
                    <div
                        ref={cardRef}
                        className={cn(
                            "group relative isolate aspect-4/3 w-full overflow-hidden rounded-sm shadow-2xl ring-4 ring-white",
                            lightboxOpen && "invisible",
                        )}
                    >
                        <img
                            src={
                                "https://r2.yencheng.dev" +
                                activeImage.paths[popupImageIndex]
                            }
                            alt={activeImage.description || ""}
                            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                        {/* Navigation Buttons */}
                        {activeImage.paths.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePopupNav("prev");
                                    }}
                                    className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="size-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePopupNav("next");
                                    }}
                                    className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="size-4" />
                                </button>
                            </>
                        )}

                        <div className="absolute right-0 bottom-0 left-0 flex transform flex-col justify-end gap-1.5 p-5 text-white transition-transform duration-500 group-hover:translate-y-[-4px]">
                            <div className="flex items-center justify-between opacity-80 mix-blend-screen">
                                {activeImage.date && (
                                    <span className="font-mono text-[10px] tracking-[0.2em] text-white/90 uppercase">
                                        {activeImage.date.replace(/-/g, ".")}
                                    </span>
                                )}
                                {activeImage.paths.length > 1 && (
                                    <span className="font-mono text-[10px] text-white/70">
                                        {popupImageIndex + 1} /{" "}
                                        {activeImage.paths.length}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg leading-tight font-medium tracking-wider text-white drop-shadow-md">
                                {activeImage.description}
                            </h3>
                        </div>

                        <button
                            onClick={() => {
                                const card = cardRef.current;
                                const photo = card?.querySelector("img");
                                onFullscreen({
                                    data: activeImage,
                                    imageIndex: popupImageIndex,
                                    origin: card,
                                    size: photo?.naturalWidth
                                        ? {
                                              width: photo.naturalWidth,
                                              height: photo.naturalHeight,
                                          }
                                        : undefined,
                                    syncIndex: setPopupImageIndex,
                                });
                            }}
                            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                            aria-label="View fullscreen"
                        >
                            <Maximize className="size-4" />
                        </button>
                    </div>
                </MapPopup>
            )}
        </>
    );
}
