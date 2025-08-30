"use client";

import { useState, useEffect } from "react";
import {
    Info as InfoIcon,
    CircleX,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Info from "@/components/mac-screen/info";
import { InfoStyle } from "@/types/type";

interface ScreenProps {
    url: string;
    infoShow: boolean;
    title?: string;
    description?: string;
    tech?: string;
    picture?: Array<{
        src: string;
        description: string;
    }>;
    style?: InfoStyle;
}

export default function Screen({
    url,
    infoShow,
    title = "",
    description = "",
    tech = "",
    picture = [],
    style,
}: ScreenProps) {
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        setShowInfo(false);
    }, [url]);

    const displayUrl = url
        .replace(/^https?:\/\/(www\.)?/, "")
        .replace(/\/$/, "")
        .replace(/^\//, "");

    return (
        <div className="shadow-white-brown-600 relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl select-none sm:shadow-none">
            <div className="hidden w-full sm:block">
                <div className="flex h-12 w-full items-center justify-between bg-[#F9FBFD] px-6 opacity-85">
                    <div className="flex w-36 items-center justify-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#FF5F56]"></div>
                        <div className="h-3 w-3 rounded-full bg-[#FFBD2E]"></div>
                        <div className="h-3 w-3 rounded-full bg-[#27C93F]"></div>
                        <ChevronLeft
                            size={28}
                            strokeWidth={2}
                            className="ml-4"
                        />
                        <ChevronRight size={28} strokeWidth={2} />
                    </div>
                    <div className="flex h-8 w-[35%] items-center justify-center rounded-md bg-[#CCD3D8]">
                        <span className="text-white-black-900 text-center text-xs font-semibold select-none">
                            {displayUrl}
                        </span>
                    </div>
                    <div className="flex w-36 items-center justify-end px-2">
                        {infoShow && (
                            <button
                                className="relative cursor-pointer"
                                onClick={() => setShowInfo(!showInfo)}
                                type="button"
                            >
                                <div className="bg-white-black-500 absolute inset-0 h-6 w-6 animate-ping rounded-full opacity-75"></div>
                                <InfoIcon className="text-white-black-900 relative" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showInfo && (
                <div
                    className={`no-scrollbar absolute top-[53%] left-1/2 h-[65vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-scroll rounded-2xl border-8 ${style?.border}`}
                >
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            className={`cursor-pointer ${style?.icon}`}
                            onClick={() => setShowInfo(!showInfo)}
                            type="button"
                        >
                            <CircleX size={32} strokeWidth={2.5} />
                        </button>
                    </div>
                    <Info
                        title={title}
                        description={description}
                        tech={tech}
                        picture={picture}
                        style={
                            style || {
                                border: "border-brown-400",
                                bg: "bg-white-brown-400",
                                secondBg: "bg-white-brown-600",
                                icon: "text-white-brown-600",
                                text: "text-white-black-900",
                            }
                        }
                    />
                </div>
            )}

            <div className="w-full grow">
                <iframe
                    src={url}
                    className="h-full w-full border-none"
                ></iframe>
            </div>
        </div>
    );
}
