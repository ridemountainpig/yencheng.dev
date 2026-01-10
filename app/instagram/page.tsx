/* eslint-disable @next/next/no-img-element */
"use client";

import { X, Play } from "lucide-react";
import { useState, useEffect } from "react";
import Title from "@/components/title";
import { motion } from "framer-motion";
import highlightUrls from "./highlight-urls.json";

type HighlightItem = {
    img: string;
    url: string;
};

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function isVideo(url: string): boolean {
    return (
        url.includes(".mp4") || url.includes("/v/t2/") || url.includes("video")
    );
}

export default function InstagramPage() {
    const [selectedItem, setSelectedItem] = useState<HighlightItem | null>(
        null,
    );
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const [shuffledData, setShuffledData] = useState<HighlightItem[]>(
        highlightUrls as HighlightItem[],
    );

    useEffect(() => {
        setShuffledData(shuffleArray(highlightUrls as HighlightItem[]));
    }, []);

    useEffect(() => {
        setIsVideoLoaded(false);
    }, [selectedItem]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && selectedItem) {
                setSelectedItem(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedItem]);

    const isSelectedVideo = selectedItem ? isVideo(selectedItem.url) : false;

    return (
        <>
            <div className="relative h-screen w-full overflow-hidden rounded-lg bg-white">
                <div className="no-scrollbar h-full overflow-y-auto p-4 md:p-6">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        <div className="col-span-2 flex min-h-70 flex-col items-center justify-center gap-y-4 p-4">
                            <Title title="My" textStyle="tracking-widest" />
                            <Title
                                title="Instagram Highlights"
                                textStyle="tracking-widest"
                            />
                            <span className="text-white-brown-800 font-nunito mt-2 text-center tracking-widest">
                                Little moments that tell the story of my life
                                and travels.
                            </span>
                        </div>

                        {shuffledData.map((item, index) => (
                            <motion.div
                                key={index}
                                className="group cursor-pointer overflow-hidden rounded-lg"
                                onClick={() => setSelectedItem(item)}
                                initial={{
                                    opacity: 0,
                                    y: 100,
                                    filter: "blur(10px)",
                                }}
                                whileInView={{
                                    opacity: 1,
                                    y: 0,
                                    filter: "blur(0px)",
                                }}
                                viewport={{
                                    once: true,
                                    margin: "-50px",
                                }}
                                transition={{
                                    duration: 0.5,
                                    ease: "easeOut",
                                }}
                            >
                                <div className="relative overflow-hidden rounded-lg transition-transform duration-300 ease-out group-hover:scale-[1.03]">
                                    <img
                                        src={item.img}
                                        alt={`Instagram highlight ${index + 1}`}
                                        width={400}
                                        height={600}
                                        className="w-full object-cover transition-all duration-300 group-hover:brightness-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
                                    {isVideo(item.url) && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="rounded-full bg-black/40 p-3 backdrop-blur-sm">
                                                <Play className="size-6 fill-white text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fullscreen Lightbox */}
            {selectedItem && (
                <div
                    className="animate-in fade-in-0 fixed inset-0 z-50 flex items-center justify-center bg-black/90 duration-200"
                    onClick={() => setSelectedItem(null)}
                >
                    <button
                        onClick={() => setSelectedItem(null)}
                        className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                        aria-label="Close fullscreen"
                    >
                        <X className="size-6" />
                    </button>

                    <div
                        className="pointer-events-none relative max-h-[90vh] max-w-[90vw]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="pointer-events-auto flex items-center justify-center">
                            {isSelectedVideo ? (
                                <video
                                    src={selectedItem.url}
                                    controls
                                    autoPlay
                                    playsInline
                                    muted
                                    onLoadedData={() => setIsVideoLoaded(true)}
                                    className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                                />
                            ) : (
                                <img
                                    src={selectedItem.url}
                                    alt="Full size view"
                                    width={1200}
                                    height={1600}
                                    className="max-h-[90vh] max-w-full rounded-lg object-contain"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
