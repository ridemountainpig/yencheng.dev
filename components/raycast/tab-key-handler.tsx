"use client";

import { useEffect } from "react";
import { useHomeScroll } from "@/components/home-scroller";

export default function TabKeyHandler() {
    const { activeSection, menuOpen } = useHomeScroll();

    useEffect(() => {
        // Every home section stays mounted, so only take over Tab while the
        // Raycast section is on screen; elsewhere it moves focus as usual.
        if (activeSection !== "raycast" || menuOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Tab") {
                event.preventDefault();
                window.open("https://raycast.com/ridemountainpig", "_blank");
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [activeSection, menuOpen]);

    return null;
}
