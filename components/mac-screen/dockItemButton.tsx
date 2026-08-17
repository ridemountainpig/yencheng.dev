"use client";

import { useRef } from "react";
import {
    motion,
    useTransform,
    useSpring,
    useReducedMotion,
    MotionValue,
} from "framer-motion";
import { DockItem } from "@/types/type";

const BASE_WIDTH = 45;
const MAX_WIDTH = 80;
const FALLOFF = 140;

export default function DockItemButton({
    item,
    mouseX,
    magnify,
    isActive,
    onClick,
}: {
    item: DockItem;
    mouseX: MotionValue<number>;
    magnify: boolean;
    isActive: boolean;
    onClick: (item: DockItem) => void;
}) {
    const ref = useRef<HTMLImageElement>(null);
    const reducedMotion = useReducedMotion();

    const distance = useTransform(mouseX, (x: number) => {
        const bounds = ref.current?.getBoundingClientRect();
        if (!bounds) return Infinity;
        return x - bounds.x - bounds.width / 2;
    });

    const widthTarget = useTransform(
        distance,
        [-FALLOFF, 0, FALLOFF],
        [BASE_WIDTH, MAX_WIDTH, BASE_WIDTH],
    );

    const width = useSpring(widthTarget, {
        mass: 0.1,
        stiffness: 170,
        damping: 14,
    });

    const animated = magnify && !reducedMotion;

    const ButtonContent = (
        <>
            <motion.img
                ref={ref}
                style={animated ? { width } : undefined}
                className={`${item.className} aspect-square w-10 shrink-0 object-contain transition-[filter] duration-100 group-active:brightness-75 sm:w-[45px]`}
                src={item.src}
                alt={item.alt}
                draggable={false}
            />
            <span
                className={`bg-white-black-700/70 absolute -bottom-[7px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-opacity duration-200 ${
                    isActive ? "opacity-100" : "opacity-0"
                }`}
            />
            <div className="pointer-events-none absolute -top-16 left-1/2 z-10 hidden origin-bottom -translate-x-1/2 translate-y-1.5 scale-90 opacity-0 blur-[2px] transition-all duration-150 ease-out group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-hover:blur-none group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100 group-focus-visible:blur-none motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:blur-none motion-reduce:transition-opacity sm:block">
                <div className="liquid-glass-chip text-white-black-900 relative rounded-full px-3.5 py-2 text-[13px] leading-none tracking-[0.02em] whitespace-nowrap">
                    {item.label}
                    <span className="pointer-events-none absolute top-full left-1/2 h-[7px] w-5 -translate-x-1/2 overflow-hidden">
                        <span className="liquid-glass-tail absolute -top-2.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-[3px]" />
                    </span>
                </div>
            </div>
        </>
    );

    const buttonClassName =
        "group relative flex h-10 shrink-0 items-end justify-center rounded-xl focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:outline-none sm:h-[45px]";

    return item.link ? (
        <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClassName}
        >
            {ButtonContent}
        </a>
    ) : (
        <button
            type="button"
            className={buttonClassName}
            onClick={() => onClick(item)}
        >
            {ButtonContent}
        </button>
    );
}
