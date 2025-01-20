"use client";

import { useState, useEffect, useCallback } from "react";
import DynamicDock from "dynamic-dock";
import { DockItem, InfoStyle } from "@/types/type";
import Screen from "@/components/mac-screen/screen";
import DockItemButton from "@/components/mac-screen/dockItemButton";

export default function Dock() {
    const [screenState, setScreenState] = useState({
        url: "/finder",
        showInfo: false,
        title: "",
        description: "",
        tech: "",
        picture: [] as Array<{ src: string; description: string }>,
        style: {} as InfoStyle,
    });

    const handleItemClick = useCallback((item: DockItem) => {
        setScreenState({
            url: item.url,
            showInfo: item.showInfo,
            title: item.info?.title || "",
            description: item.info?.description || "",
            tech: item.info?.tech || "",
            picture: item.info?.picture || [],
            style: item.info?.style || {
                border: item.info?.style?.border || "border-brown-400",
                bg: item.info?.style?.bg || "bg-white-brown-400",
                secondBg: item.info?.style?.secondBg || "bg-white-brown-600",
                icon: item.info?.style?.icon || "text-white-brown-600",
            },
        });
    }, []);

    useEffect(() => {
        const initialData = {
            url: "/finder",
            showInfo: false,
            title: "",
            description: "",
            tech: "",
            picture: [],
            style: {
                border: "",
                bg: "",
                secondBg: "",
                icon: "",
            },
        };

        setScreenState(initialData);
    }, []);

    const dockItems: DockItem[] = [
        {
            src: "/dock/finder.png",
            alt: "finder icon",
            className: "rounded-xl",
            label: "Finder",
            url: "/finder",
            showInfo: false,
            link: false,
        },
        {
            src: "/dock/github.png",
            alt: "github icon",
            className: "rounded-xl",
            label: "My GitHub",
            url: "https://github.com/ridemountainpig",
            showInfo: false,
            link: true,
        },
        {
            src: "/dock/coffee-diary.png",
            alt: "coffee diary icon",
            className: "rounded-xl bg-[#FAF9F2]",
            label: "Coffee Diary",
            url: "https://www.coffee-diary.com/",
            showInfo: true,
            link: false,
            info: {
                title: "Coffee Diary",
                description:
                    "Engineers often need a cup of coffee to accompany their coding sessions each day, and every cup of coffee has its unique flavor worth documenting. This inspired the idea for the Coffee Diary project.\nCoffee Diary allows users to record their daily coffee experiences through a JSON file, including details like coffee bean types, origins, and flavor descriptions. These records are then visualized into beautiful SVG graphics for documenting and sharing their coffee journal.\nUsers simply need to create a file named coffee-diary.json in their GitHub repository and fill it out according to the specified format. Once completed, the system will generate a corresponding coffee journal SVG image for personal display or sharing with others. Users can even access their records directly on the Coffee Diary website, making the entire process efficient and convenient.\nCoffee Diary not only enhances the convenience of recording and sharing coffee experiences but also offers developers a fun way to integrate life and technology, presenting each day's coffee memories in a visually appealing format.",
                tech: "TypeScript, Next.js, Tailwind CSS",
                picture: [
                    {
                        src: "/coffee-diary/1.png",
                        description: "Personal Coffee Diary",
                    },
                    {
                        src: "/coffee-diary/2.png",
                        description: "Coffee Diary SVG",
                    },
                ],
                style: {
                    border: "border-white-brown-600",
                    bg: "bg-white-brown-400",
                    secondBg: "bg-white-brown-600",
                    icon: "text-white-brown-600",
                },
            },
        },
        {
            src: "/dock/hue.png",
            alt: "hue icon",
            className: "rounded-xl bg-white",
            label: "Hue Palette",
            url: "https://www.hue-palette.com/",
            showInfo: true,
            link: false,
            info: {
                title: "Hue Palette",
                description:
                    "Hue Palette is an innovative tool designed specifically for designers and developers, inspired by the need for harmonious and precise color combinations in projects. This tool offers an intuitive platform that allows users to quickly create custom color palettes, catering to diverse design and development needs.\nWith Hue Palette, users can define base hues, adjust related parameters, and generate color schemes tailored to their projects. The system also supports integration with Tailwind CSS, automatically generating the corresponding configuration code for seamless use in front-end development workflows.\nThe advent of Hue Palette enables designers and developers to manage color combinations more efficiently, focus on creative execution, and ensure the visual effects of their projects are optimized to their fullest potential.",
                tech: "TypeScript, Next.js, Tailwind CSS",
                picture: [
                    {
                        src: "/hue-palette/1.png",
                        description: "Hue Generator",
                    },
                    {
                        src: "/hue-palette/2.png",
                        description: "Hue Color Palette",
                    },
                ],
                style: {
                    border: "border-slate-400",
                    bg: "bg-white",
                    secondBg: "bg-slate-300",
                    icon: "text-slate-300",
                },
            },
        },
        {
            src: "/dock/monkeytype-readme.png",
            alt: "monkeytype readme icon",
            className: "rounded-xl bg-white p-1.5",
            label: "Monkeytype Readme",
            url: "https://monkeytype-readme.com/",
            showInfo: false,
            link: false,
        },
        {
            src: "/dock/svgl.png",
            alt: "svgl icon",
            className: "rounded-xl",
            label: "SVGL Badge",
            url: "https://svgl-badge.vercel.app/",
            showInfo: false,
            link: false,
        },
    ];

    return (
        <>
            <div className="absolute bottom-[5rem] left-1/2 flex h-[86%] w-full -translate-x-1/2 transform sm:w-[95%]">
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

            <div className="group absolute bottom-2 left-1/2 flex h-[4rem] w-[88%] -translate-x-1/2 transform items-center justify-center rounded-[1.25rem] bg-white-brown-600 bg-opacity-50 p-2 sm:bottom-2 sm:w-fit sm:rounded-2xl sm:bg-menubar sm:bg-opacity-40 sm:p-3">
                <div className="flex h-full items-center gap-x-2 sm:gap-x-3 md:group-hover:hidden">
                    {dockItems.map((item, index) => (
                        <DockItemButton
                            key={item.url}
                            item={item}
                            index={index}
                            onClick={handleItemClick}
                        />
                    ))}
                </div>

                <div className="hidden md:group-hover:block">
                    <DynamicDock gapX={10} imageWidth={50}>
                        {dockItems.map((item, index) => (
                            <DockItemButton
                                key={item.url}
                                item={item}
                                index={index}
                                onClick={handleItemClick}
                            />
                        ))}
                    </DynamicDock>
                </div>
            </div>
        </>
    );
}
