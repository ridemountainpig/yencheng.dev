"use client";

import { motion } from "framer-motion";

interface TitleProps {
    title: string;
    bgColor?: string;
}

export default function SecondTitle({
    title,
    bgColor = "bg-white-brown-600",
}: TitleProps) {
    return (
        <div className="relative inline-block overflow-hidden">
            <motion.span
                className={`absolute bottom-1 left-0 h-3 w-full ${bgColor} opacity-90`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{ transformOrigin: "left" }}
            ></motion.span>
            <span className="relative font-gensenb text-2xl">{title}</span>
        </div>
    );
}
