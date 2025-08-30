"use client";

import { useState, useEffect } from "react";

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
        <div className="flex w-full justify-between p-3 select-none">
            <div className="group bg-menubar/40 relative rounded-xl p-2 px-2.5 whitespace-nowrap">
                <img
                    className="hover:bg-menubar/30 rounded-sm"
                    src="/yencheng.png"
                    height={22}
                    width={22}
                    alt="personal icon"
                />
                <div className="absolute top-12 left-0 hidden group-hover:block">
                    <div className="bg-menubar/40 font-nunito text-white-black-900 rounded-xl p-2 text-xs tracking-wide">
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

            <div className="bg-white-black-200/40 font-nunito flex items-center justify-center rounded-xl p-2 px-3 text-xs text-white">
                <span>{dateInfo}</span>
            </div>
        </div>
    );
}
