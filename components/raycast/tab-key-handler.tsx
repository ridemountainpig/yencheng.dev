"use client";

import { useEffect } from "react";

export default function TabKeyHandler() {
    useEffect(() => {
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
    }, []);

    return null;
}
