"use client";

import { CircleArrowDown, ArrowUp } from "lucide-react";
import { useHomeScroll } from "@/components/home-scroller";

// The entrance runs on CSS keyframes (see .hero-rise in globals.css) so it
// starts with the first paint instead of waiting for hydration.
export default function Banner() {
    const { scrollToSection } = useHomeScroll();

    return (
        <div className="font-nunito text-white-black-900 flex h-full w-full items-center justify-center tracking-wider select-none">
            <div className="-mt-8 w-full text-center">
                <div className="hero-rise text-4xl sm:text-6xl">Hello</div>
                <br />
                <div className="flex h-fit items-center justify-center py-4 text-3xl sm:text-5xl">
                    <div className="hero-rise py-2 pr-4 [animation-delay:80ms]">
                        I&apos;m
                    </div>
                    <div>
                        <div className="relative inline-block">
                            <div className="hero-underline bg-white-brown-600 absolute bottom-1 left-0 h-6 w-full opacity-90 [animation-delay:450ms]"></div>
                            <span className="hero-rise relative inline-block py-2 [animation-delay:160ms]">
                                Yen Cheng Lin
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="hero-rise absolute bottom-22 flex w-full justify-center [--hero-rise:130px] [animation-delay:500ms]">
                <button
                    type="button"
                    className="bg-white-brown-500 text-white-brown-800 flex h-10 w-fit cursor-pointer items-center justify-center gap-x-2 rounded-full px-4 text-sm sm:text-xl"
                    onClick={() => scrollToSection("portfolio")}
                >
                    <span>About Me</span>
                    <CircleArrowDown
                        strokeWidth={2.25}
                        size={24}
                        className="hidden sm:block"
                    />
                    <CircleArrowDown
                        strokeWidth={2.25}
                        size={20}
                        className="sm:hidden"
                    />
                </button>
            </div>
            <div className="hero-rise absolute bottom-5 flex w-full justify-center [--hero-rise:130px] [animation-delay:500ms]">
                <div className="sm:text-md text-white-black-900 flex h-fit w-fit animate-bounce flex-col items-center justify-center text-sm motion-reduce:animate-none">
                    <ArrowUp
                        strokeWidth={3.5}
                        size={20}
                        className="hidden sm:block"
                    />
                    <ArrowUp
                        strokeWidth={3.5}
                        size={16}
                        className="sm:hidden"
                    />
                    <span>Click</span>
                </div>
            </div>
        </div>
    );
}
