"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import RaycastExtItem from "@/components/raycast/raycast-ext-item";
import RaycastConfettiItem, {
    triggerConfetti,
} from "@/components/raycast/raycast-confetti-item";
import { Extension } from "@/types/type";

interface RaycastExtensionsProps {
    extensions: Extension[];
    contributionExtensions: Extension[];
}

export default function RaycastExtensions({
    extensions,
    contributionExtensions,
}: RaycastExtensionsProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const isFirstRender = useRef(true);

    const allExtensions = [...extensions, ...contributionExtensions];
    // +1 for Confetti item at index 0
    const totalItems = allExtensions.length + 1;

    // Use IntersectionObserver to detect if the component is visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.5 },
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    // When the selected item changes, scroll to the item (skip the first render)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const selectedItem = itemRefs.current[selectedIndex];
        if (selectedItem) {
            selectedItem.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    }, [selectedIndex]);

    const handleConfettiAction = useCallback(() => {
        triggerConfetti();
    }, []);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Only handle keyboard events when the component is visible
            if (!isVisible) return;

            if (event.key === "ArrowDown") {
                event.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % totalItems);
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setSelectedIndex((prev) =>
                    prev === 0 ? totalItems - 1 : prev - 1,
                );
            } else if (event.key === "Enter") {
                event.preventDefault();
                if (selectedIndex === 0) {
                    handleConfettiAction();
                } else {
                    const extensionIndex = selectedIndex - 1;
                    const selectedExtension = allExtensions[extensionIndex];
                    if (selectedExtension?.store_url) {
                        window.open(selectedExtension.store_url, "_blank");
                    }
                }
            }
        },
        [
            isVisible,
            selectedIndex,
            allExtensions,
            totalItems,
            handleConfettiAction,
        ],
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    const handleItemClick = (index: number) => {
        setSelectedIndex(index);
        if (index === 0) {
            handleConfettiAction();
        } else {
            const extensionIndex = index - 1;
            const extension = allExtensions[extensionIndex];
            if (extension?.store_url) {
                window.open(extension.store_url, "_blank");
            }
        }
    };

    return (
        <div
            ref={containerRef}
            className="no-scrollbar h-[378px] overflow-y-auto"
        >
            <div className="px-[18px] pt-2">
                <span className="text-xs font-semibold">Commands</span>
            </div>
            <div className="px-[8px] pt-2">
                <div
                    ref={(el) => {
                        itemRefs.current[0] = el;
                    }}
                    onClick={() => handleItemClick(0)}
                >
                    <RaycastConfettiItem isSelected={selectedIndex === 0} />
                </div>
            </div>
            <div className="px-[18px] pt-2">
                <span className="text-xs font-semibold">My Extensions</span>
            </div>
            <div className="px-[8px] pt-2">
                {extensions?.map((extension, index) => {
                    const globalIndex = index + 1;
                    return (
                        <div
                            key={"MyExtensions" + index}
                            ref={(el) => {
                                itemRefs.current[globalIndex] = el;
                            }}
                            onClick={() => handleItemClick(globalIndex)}
                        >
                            <RaycastExtItem
                                extension={extension}
                                isSelected={selectedIndex === globalIndex}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="px-[18px] pt-2">
                <span className="text-xs font-semibold">
                    My Contributions Extensions
                </span>
            </div>
            <div className="px-[8px] pt-2">
                {contributionExtensions?.map((extension, index) => {
                    const globalIndex = extensions.length + index + 1;
                    return (
                        <div
                            key={"MyContributionsExtensions" + index}
                            ref={(el) => {
                                itemRefs.current[globalIndex] = el;
                            }}
                            onClick={() => handleItemClick(globalIndex)}
                        >
                            <RaycastExtItem
                                extension={extension}
                                isSelected={selectedIndex === globalIndex}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
