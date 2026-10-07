"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface TitleProps {
    title: string;
    bgColor?: string;
    textStyle?: string;
    as?: "h2" | "h3" | "span";
}

export default function Title({
    title,
    bgColor = "bg-white-brown-600",
    textStyle = "",
    as: Tag = "span",
}: TitleProps) {
    const ref = useRef<HTMLDivElement>(null);
    // Every home section mounts at once, so the underline draws when the
    // title scrolls into view rather than on mount, when most are off screen.
    // Watch the whole title: the underline itself starts at zero width, and
    // the browser cannot reliably tell whether a zero-width box is on screen.
    const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
    const reducedMotion = useReducedMotion();

    return (
        <div
            ref={ref}
            className="relative inline-block overflow-hidden select-none"
        >
            <motion.span
                className={`absolute bottom-1 left-0 h-4 w-full ${bgColor} opacity-90`}
                initial={reducedMotion ? false : { scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : undefined}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{ transformOrigin: "left" }}
            ></motion.span>
            <Tag
                className={`font-nunito relative text-2xl sm:text-3xl ${textStyle}`}
            >
                {title}
            </Tag>
        </div>
    );
}
