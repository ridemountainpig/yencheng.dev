"use client";

import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface RaycastConfettiItemProps {
    isSelected?: boolean;
    onClick?: () => void;
}

export function triggerConfetti() {
    const end = Date.now() + 0.5 * 1000;
    const colors = [
        "#7B8FD9",
        "#D76BAE",
        "#6B5FD9",
        "#D4B94F",
        "#8FBF8F",
        "#D97F4D",
        "#5972BF",
        "#B24C8C",
        "#B2993F",
        "#669966",
    ];

    const frame = () => {
        if (Date.now() > end) return;

        confetti({
            particleCount: 10,
            shapes: ["circle", "square"],
            angle: 70,
            spread: 100,
            startVelocity: 90,
            scalar: 1.6,
            origin: { x: 0, y: 1 },
            colors: colors,
        });
        confetti({
            particleCount: 10,
            shapes: ["circle", "square"],
            angle: 110,
            spread: 100,
            startVelocity: 90,
            scalar: 1.6,
            origin: { x: 1, y: 1 },
            colors: colors,
        });

        requestAnimationFrame(frame);
    };

    frame();
}

export default function RaycastConfettiItem({
    isSelected = false,
    onClick,
}: RaycastConfettiItemProps) {
    return (
        <div
            className={cn(
                "flex h-[38px] cursor-pointer items-center rounded-[10px] px-2",
                isSelected
                    ? "bg-white-brown-600/80"
                    : "bg-white-brown-500 hover:bg-white-brown-600/60",
            )}
            onClick={onClick}
        >
            <span className="flex w-[26px] shrink-0 justify-center text-[23px] leading-none">
                🎉
            </span>
            <span className="ml-2.5 truncate text-[15px] font-medium">
                Confetti
            </span>
            <span className="text-white-black-700 ml-3.5 hidden text-[15px] md:block">
                Raycast
            </span>
            <span className="text-white-black-700 ml-auto shrink-0 pl-3 text-sm">
                Command
            </span>
        </div>
    );
}
