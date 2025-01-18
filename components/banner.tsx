"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Banner() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className="flex h-[90vh] w-full select-none items-center justify-center font-gensenb tracking-wider text-white-black-900">
            <div className="w-full text-center">
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
                                className="absolute bottom-1 left-0 h-6 w-full bg-white-brown-600 opacity-90"
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
            {isVisible && (
                <motion.div
                    className="absolute bottom-8 flex w-full justify-center"
                    initial={{ opacity: 1, y: 0 }}
                    animate={{
                        opacity: isVisible ? 1 : 0,
                        y: isVisible ? 0 : 20,
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    <div className="flex h-10 w-fit animate-bounce items-center justify-center rounded-full bg-white-brown-500 px-4 text-white-brown-800">
                        <span>About Me</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
