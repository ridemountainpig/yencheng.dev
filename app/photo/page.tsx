"use client";

import {
    Map,
    MapMarker,
    MarkerContent,
    MapPopup,
    MapControls,
    useMap,
} from "@/components/ui/map";
import { ChevronLeft, ChevronRight, Maximize, X } from "lucide-react";
import Image from "next/image";
import { useState, useCallback } from "react";
import images from "./images.json";

type ImageData = {
    paths: string[];
    description?: string;
    date?: string;
    latitude?: number;
    longitude?: number;
};

export default function PhotoPage() {
    const [fullscreenImage, setFullscreenImage] = useState<{
        data: ImageData;
        imageIndex: number;
    } | null>(null);

    const imagesWithLocation = (images as ImageData[]).filter(
        (image) => image.latitude && image.longitude,
    );

    const handleFullscreenNav = (direction: "prev" | "next") => {
        if (!fullscreenImage) return;
        const { data, imageIndex } = fullscreenImage;
        const newIndex =
            direction === "prev"
                ? (imageIndex - 1 + data.paths.length) % data.paths.length
                : (imageIndex + 1) % data.paths.length;
        setFullscreenImage({ data, imageIndex: newIndex });
    };

    return (
        <>
            <div className="h-screen overflow-hidden rounded-lg">
                <Map center={[120.76988332999102, 23.64478894511211]} zoom={4}>
                    <MapControls showZoom showFullscreen />
                    <PhotoMarkers
                        images={imagesWithLocation}
                        onFullscreen={(data, imageIndex) =>
                            setFullscreenImage({ data, imageIndex })
                        }
                    />
                </Map>
            </div>

            {/* Fullscreen Lightbox */}
            {fullscreenImage && (
                <div
                    className="animate-in fade-in-0 fixed inset-0 z-50 flex items-center justify-center bg-black/90 duration-200"
                    onClick={() => setFullscreenImage(null)}
                >
                    <button
                        onClick={() => setFullscreenImage(null)}
                        className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                        aria-label="Close fullscreen"
                    >
                        <X className="size-6" />
                    </button>

                    {/* Navigation Buttons */}
                    {fullscreenImage.data.paths.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFullscreenNav("prev");
                                }}
                                className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="size-6" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFullscreenNav("next");
                                }}
                                className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                                aria-label="Next image"
                            >
                                <ChevronRight className="size-6" />
                            </button>
                        </>
                    )}

                    <div
                        className="pointer-events-none relative max-h-[90vh] max-w-[90vw]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="pointer-events-auto">
                            <Image
                                src={
                                    fullscreenImage.data.paths[
                                        fullscreenImage.imageIndex
                                    ]
                                }
                                alt={fullscreenImage.data.description || ""}
                                width={1200}
                                height={1600}
                                className="max-h-[90vh] max-w-full object-contain"
                            />
                        </div>
                        <div className="pointer-events-auto absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/60 to-transparent p-4 text-white">
                            <p className="font-medium">
                                {fullscreenImage.data.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-white/70">
                                    {fullscreenImage.data.date}
                                </p>
                                {fullscreenImage.data.paths.length > 1 && (
                                    <p className="text-sm text-white/70">
                                        {fullscreenImage.imageIndex + 1} /{" "}
                                        {fullscreenImage.data.paths.length}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function PhotoMarkers({
    images,
    onFullscreen,
}: {
    images: ImageData[];
    onFullscreen: (data: ImageData, imageIndex: number) => void;
}) {
    const { map } = useMap();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [popupImageIndex, setPopupImageIndex] = useState(0);

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
                            <Image
                                src={image.paths[0]}
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
                    <div className="group relative isolate aspect-4/3 w-full overflow-hidden rounded-sm shadow-2xl ring-4 ring-white">
                        <Image
                            fill
                            src={activeImage.paths[popupImageIndex]}
                            alt={activeImage.description || ""}
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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
                            onClick={() =>
                                onFullscreen(activeImage, popupImageIndex)
                            }
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
