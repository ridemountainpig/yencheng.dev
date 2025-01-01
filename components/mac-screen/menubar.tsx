"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Menubar() {
    const [dateInfo, setDateInfo] = useState("");

    useEffect(() => {
        const updateDateInfo = () => {
            const now = new Date();
            const options: Intl.DateTimeFormatOptions = {
                month: "numeric",
                day: "numeric",
            };
            const formattedDate = now
                .toLocaleDateString("en-US", options)
                .replace(",", "");
            setDateInfo(formattedDate);
        };

        updateDateInfo();
    }, []);

    const infoItems = [
        { emoji: "🇹🇼", text: "Full-stack Developer from Taiwan" },
        { emoji: "✨", text: "Passionate Creator of Amazing Things" },
        { emoji: "🤝", text: "Open Source Contributor" },
        { emoji: "☕️", text: "Coffee-fueled Coder" },
    ];

    return (
        <div className="flex w-full select-none justify-between p-3">
            <div className="group relative whitespace-nowrap rounded-xl bg-menubar bg-opacity-40 p-2 px-2.5">
                <Image
                    className="rounded-sm hover:bg-opacity-30"
                    src="/yencheng.png"
                    height={22}
                    width={22}
                    alt="personal icon"
                />
                <div className="absolute left-0 top-12 hidden group-hover:block">
                    <div className="rounded-xl bg-menubar bg-opacity-40 p-2 font-gensenb text-xs tracking-wide text-white-black-900">
                        {infoItems.map((item, index) => (
                            <div key={index}>
                                <div className="flex items-center gap-2 px-2 py-2">
                                    <span>{item.emoji}</span>
                                    <span>{item.text}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center rounded-xl bg-white-black-200 bg-opacity-40 p-2 px-3 font-gensenb text-xs text-white">
                <span>{dateInfo}</span>
            </div>
        </div>
    );
}
