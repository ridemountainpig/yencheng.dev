"use client";

import { Undo2 } from "lucide-react";
import { useCarousel } from "@/components/ui/carousel";

export default function Footer() {
    const { scrollPrev } = useCarousel();

    return (
        <footer className="xs:text-lg font-nunito text-white-black-900 flex h-screen flex-col items-center justify-center text-sm tracking-wider select-none md:text-xl">
            <h2>
                © {new Date().getFullYear()} Yen Cheng Lin. All rights reserved
            </h2>
            <div className="cursor-pointer pt-4" onClick={scrollPrev}>
                <Undo2
                    strokeWidth={2.25}
                    size={30}
                    className="hidden sm:block"
                />
                <Undo2 strokeWidth={2.25} size={24} className="sm:hidden" />
            </div>
        </footer>
    );
}
