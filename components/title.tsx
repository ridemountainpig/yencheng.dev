"use client";

import { motion } from "framer-motion";

interface TitleProps {
    title: string;
    bgColor?: string;
}

export default function Title({
    title,
    bgColor = "bg-white-brown-600",
}: TitleProps) {
    return (
        <div className="relative inline-block overflow-hidden select-none">
            <motion.span
                className={`absolute bottom-1 left-0 h-4 w-full ${bgColor} opacity-90`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{ transformOrigin: "left" }}
            ></motion.span>
            <span className="font-nunito relative text-2xl sm:text-3xl">
                {title}
            </span>
        </div>
    );
}
