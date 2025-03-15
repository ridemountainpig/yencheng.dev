"use client";

import { useState } from "react";
import { DockItem } from "@/types/type";

export default function DockItemButton({
    item,
    onClick,
}: {
    item: DockItem;
    onClick: (item: DockItem) => void;
}) {
    const [hover, setHover] = useState(false);

    const ButtonContent = (
        <>
            <img
                className={item.className}
                src={item.src}
                height={45}
                width={45}
                alt={item.alt}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            />
            <div
                className={`absolute -top-11 z-10 ${hover ? "block" : "hidden"}`}
            >
                <div className="bg-dock-tooltip text-white-black-900 relative rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-lg">
                    {item.label}
                    <span className="bg-dock-tooltip absolute top-full left-1/2 -mt-1.5 -ml-1 h-3 w-3 rotate-45 rounded-br-sm" />
                </div>
            </div>
        </>
    );

    return item.link ? (
        <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col items-center justify-center focus:outline-hidden"
        >
            {ButtonContent}
        </a>
    ) : (
        <button
            type="button"
            className="group relative flex flex-col items-center justify-center focus:outline-hidden"
            onClick={() => onClick(item)}
        >
            {ButtonContent}
        </button>
    );
}
