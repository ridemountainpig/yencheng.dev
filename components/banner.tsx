"use client";

import { motion } from "framer-motion";
import { CircleArrowRight, ArrowUp } from "lucide-react";
import { useCarousel } from "@/components/ui/carousel";

export default function Banner() {
    const { scrollNext } = useCarousel();

    return (
        <div className="font-nunito text-white-black-900 flex h-[90vh] w-full items-center justify-center tracking-wider select-none">
            <div className="-mt-8 w-full text-center">
                <h2 className="hidden">Hello, I&apos;m Yen Cheng Lin</h2>
                <motion.div
                    className="text-4xl sm:text-6xl"
                    initial={{ opacity: 0, scale: 1, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    Hello
                </motion.div>
                <br />
                <div className="flex h-fit items-center justify-center py-4 text-3xl sm:text-5xl">
                    <motion.div
                        className="py-2 pr-4"
                        initial={{ opacity: 0, scale: 1, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                            duration: 0.5,
                            ease: "easeOut",
                            delay: 0.4,
                        }}
                    >
                        I&apos;m
                    </motion.div>
                    <div>
                        <div className="relative inline-block">
                            <motion.div
                                className="bg-white-brown-600 absolute bottom-1 left-0 h-6 w-full opacity-90"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{
                                    duration: 0.6,
                                    ease: "easeInOut",
                                    delay: 0.8,
                                }}
                                style={{ transformOrigin: "left" }}
                            ></motion.div>
                            <motion.span
                                className="relative py-2"
                                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{
                                    duration: 1,
                                    ease: "easeOut",
                                    delay: 1,
                                }}
                            >
                                Yen Cheng Lin
                            </motion.span>
                        </div>
                    </div>
                </div>
            </div>
            <motion.div
                className="absolute bottom-22 flex w-full justify-center"
                initial={{ opacity: 1, y: 130 }}
                animate={{
                    y: 0,
                }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 1.15 }}
            >
                <div
                    className="bg-white-brown-500 text-white-brown-800 flex h-10 w-fit cursor-pointer items-center justify-center gap-x-2 rounded-full px-4 text-sm sm:text-xl"
                    onClick={scrollNext}
                >
                    <span>About Me</span>
                    <CircleArrowRight
                        strokeWidth={2.25}
                        size={24}
                        className="hidden sm:block"
                    />
                    <CircleArrowRight
                        strokeWidth={2.25}
                        size={20}
                        className="sm:hidden"
                    />
                </div>
            </motion.div>
            <motion.div
                className="absolute bottom-5 flex w-full justify-center"
                initial={{ opacity: 1, y: 130 }}
                animate={{
                    y: 0,
                }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 1.15 }}
            >
                <div className="sm:text-md text-white-black-900 flex h-fit w-fit animate-bounce flex-col items-center justify-center text-sm">
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
            </motion.div>
        </div>
    );
}
