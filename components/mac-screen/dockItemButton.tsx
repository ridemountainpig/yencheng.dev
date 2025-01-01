"use client";

import Image from "next/image";
import { useState } from "react";
import { DockItem } from "@/types/type";

export default function DockItemButton({
    item,
    index,
    onClick,
}: {
    item: DockItem;
    index: number;
    onClick: (item: DockItem) => void;
}) {
    const [hover, setHover] = useState(false);

    const ButtonContent = (
        <>
            <Image
                className={item.className}
                src={item.src}
                height={45}
                width={45}
                alt={item.alt}
                priority={index < 2}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            />
            <div
                className={`absolute -top-11 z-10 ${hover ? "block" : "hidden"}`}
            >
                <div className="relative whitespace-nowrap rounded-lg bg-dock-tooltip px-3 py-2 text-xs text-white-black-900 shadow-lg">
                    {item.label}
                    <span className="absolute left-1/2 top-full -ml-1 -mt-1.5 h-3 w-3 rotate-45 rounded-br-sm bg-dock-tooltip" />
                </div>
            </div>
        </>
    );

    return item.link ? (
        <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col items-center justify-center focus:outline-none"
        >
            {ButtonContent}
        </a>
    ) : (
        <button
            type="button"
            className="group relative flex flex-col items-center justify-center focus:outline-none"
            onClick={() => onClick(item)}
        >
            {ButtonContent}
        </button>
    );
}
