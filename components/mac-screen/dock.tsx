"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, type MotionStyle } from "framer-motion";
import { DockItem, InfoStyle } from "@/types/type";
import Screen from "@/components/mac-screen/screen";
import DockItemButton from "@/components/mac-screen/dockItemButton";
import { useHomeScroll } from "@/components/home-scroller";

export default function Dock() {
    const { scrollToSection } = useHomeScroll();

    const mouseX = useMotionValue(Infinity);
    const [magnify, setMagnify] = useState(false);

    useEffect(() => {
        // Magnify grows icons from a fixed 45px, which only fits from sm up.
        const mq = window.matchMedia(
            "(hover: hover) and (pointer: fine) and (min-width: 640px)",
        );
        setMagnify(mq.matches);
        const onChange = (e: MediaQueryListEvent) => setMagnify(e.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    const [screenState, setScreenState] = useState({
        url: "/finder",
        showInfo: false,
        title: "",
        description: "",
        tech: "",
        picture: [] as Array<{ src: string; description: string }>,
        style: {} as InfoStyle,
    });

    const handleItemClick = useCallback(
        (item: DockItem) => {
            if (item.label === "My Raycast") {
                scrollToSection("raycast");
                return;
            }

            setScreenState({
                url: item.url,
                showInfo: item.showInfo,
                title: item.info?.title || "",
                description: item.info?.description || "",
                tech: item.info?.tech || "",
                picture: item.info?.picture || [],
                style: item.info?.style || {
                    border: item.info?.style?.border || "border-brown-400",
                    bg: item.info?.style?.bg || "bg-white-brown-400/100",
                    secondBg:
                        item.info?.style?.secondBg || "bg-white-brown-600/100",
                    icon: item.info?.style?.icon || "text-white-brown-600",
                    text: item.info?.style?.text || "text-white-black-900",
                },
            });
        },
        [scrollToSection],
    );

    const dockItems: DockItem[] = [
        {
            src: "/dock/finder.png",
            alt: "finder icon",
            className: "rounded-xl cursor-pointer",
            label: "Finder",
            url: "/finder",
            showInfo: false,
            link: false,
        },
        {
            src: "/dock/photo.png",
            alt: "photo icon",
            className: "rounded-xl cursor-pointer",
            label: "Photo",
            url: "/photo",
            showInfo: false,
            link: false,
        },
        {
            src: "/dock/instagram.png",
            alt: "instagram icon",
            className: "rounded-xl cursor-pointer",
            label: "Instagram",
            url: "/instagram",
            showInfo: false,
            link: false,
        },
        {
            src: "/dock/github.png",
            alt: "github icon",
            className: "rounded-xl cursor-pointer",
            label: "My GitHub",
            url: "https://github.com/ridemountainpig",
            showInfo: false,
            link: true,
        },
        {
            src: "/dock/raycast.png",
            alt: "raycast icon",
            className: "rounded-xl cursor-pointer",
            label: "My Raycast",
            url: "",
            showInfo: false,
            link: false,
        },
        {
            src: "/dock/flightcn.png",
            alt: "flightcn icon",
            className: "rounded-xl cursor-pointer",
            label: "flightcn",
            url: "https://flightcn.yencheng.dev/",
            showInfo: false,
            link: false,
        },
        {
            src: "/dock/threads-analytics.png",
            alt: "threads analytics icon",
            className: "rounded-xl cursor-pointer",
            label: "Threads Analytics",
            url: "https://threads-analytics.app/",
            showInfo: false,
            link: false,
        },
        {
            src: "/dock/subflow.png",
            alt: "subflow icon",
            className: "rounded-xl cursor-pointer",
            label: "Subflow",
            url: "https://subflow.ing/",
            showInfo: true,
            link: true,
            info: {
                title: "Subflow",
                description:
                    "Easily flow through your subscriptions with Subflow. Track spending, organize recurring payments, and take control of your subscription management. Whether it’s Netflix, Spotify, or any other recurring expenses, Subflow keeps everything organized in one place.",
                tech: "TypeScript, Next.js, Tailwind CSS, MongoDB, Clerk",
                picture: [
                    {
                        src: "/subflow/1.png",
                        description: "",
                    },
                    {
                        src: "/subflow/2.png",
                        description: "",
                    },
                    {
                        src: "/subflow/3.png",
                        description: "",
                    },
                ],
                style: {
                    border: "border-[#faf0e6]",
                    bg: "bg-[#514f50]",
                    secondBg: "bg-[#27272a95]",
                    icon: "text-[#faf0e6]",
                    text: "text-[#faf0e6]",
                },
            },
        },
    ];

    return (
        <>
            <div className="absolute bottom-20 left-1/2 flex h-[86%] w-full -translate-x-1/2 transform sm:w-[95%]">
                <Screen
                    url={screenState.url}
                    infoShow={screenState.showInfo}
                    title={screenState.title}
                    description={screenState.description}
                    tech={screenState.tech}
                    picture={screenState.picture}
                    style={screenState.style}
                />
            </div>

            <motion.div
                onMouseMove={(e) => mouseX.set(e.clientX)}
                onMouseLeave={() => mouseX.set(Infinity)}
                style={
                    {
                        // Below sm, icons shrink so the whole dock fits the
                        // screen frame with 0.5rem to spare on each side.
                        "--dock-icon": `min(2.5rem, calc((100cqw - 2rem - ${dockItems.length - 1} * 0.25rem) / ${dockItems.length}))`,
                    } as MotionStyle
                }
                className="dock-panel liquid-glass absolute bottom-2 left-1/2 flex h-[calc(var(--dock-icon)+1rem)] w-max -translate-x-1/2 transform items-end gap-x-1 rounded-[1.25rem] p-2 sm:h-[69px] sm:gap-x-2 sm:rounded-3xl sm:p-3"
            >
                {dockItems.map((item) => (
                    <DockItemButton
                        key={item.label}
                        item={item}
                        mouseX={mouseX}
                        magnify={magnify}
                        isActive={
                            !item.link &&
                            item.url !== "" &&
                            item.url === screenState.url
                        }
                        onClick={handleItemClick}
                    />
                ))}
            </motion.div>
        </>
    );
}
