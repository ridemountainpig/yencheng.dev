"use client";

import {
    useState,
    useEffect,
    useRef,
    useCallback,
    type ReactNode,
} from "react";
import {
    ArrowRightToLine,
    SquareArrowOutUpRight,
    Clipboard,
} from "lucide-react";
import RaycastExtItem from "@/components/raycast/raycast-ext-item";
import RaycastConfettiItem, {
    triggerConfetti,
} from "@/components/raycast/raycast-confetti-item";
import { Extension } from "@/types/type";
import { cn } from "@/lib/utils";

interface RaycastExtensionsProps {
    extensions: Extension[];
    contributionExtensions: Extension[];
}

const PANEL_CHROME_HEIGHT = 82;

interface PanelItem {
    label: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    iconImg?: string;
    emoji?: string;
    keys?: string[];
    run: () => void;
}

function PanelKeycaps({ keys }: { keys: string[] }) {
    return (
        <span className="ml-auto flex shrink-0 items-center gap-x-1 pl-3">
            {keys.map((key) => (
                <span
                    key={key}
                    className="border-white-black-900/25 text-white-black-700 flex h-[18px] min-w-[18px] items-center justify-center rounded-[7px] border bg-transparent px-1 text-[11px] leading-none"
                >
                    {key}
                </span>
            ))}
        </span>
    );
}

interface PanelShellProps {
    side: "left" | "right";
    title: string;
    children: ReactNode;
    footer: ReactNode;
    height?: number;
}

function PanelShell({
    side,
    title,
    children,
    footer,
    height,
}: PanelShellProps) {
    return (
        <div
            data-testid={`raycast-${side}-panel`}
            style={height ? { height } : undefined}
            className={cn(
                "border-white-black-900/10 bg-white-brown-100 absolute bottom-[7px] z-20 flex w-[350px] max-w-[calc(100%-14px)] flex-col overflow-hidden rounded-[18px] border shadow-[0_20px_56px_rgba(0,0,0,0.20),0_5px_16px_rgba(0,0,0,0.10)]",
                height === undefined && "h-[280px]",
                side === "left" ? "left-[7px]" : "right-[7px]",
            )}
        >
            <div
                data-testid="raycast-panel-header"
                className="h-8 shrink-0 px-[15px] pt-[6px]"
            >
                <span
                    data-testid="raycast-panel-title"
                    className="text-white-black-500 text-[13px]"
                >
                    {title}
                </span>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden px-2 pb-2">
                {children}
            </div>
            {footer}
        </div>
    );
}

export default function RaycastExtensions({
    extensions,
    contributionExtensions,
}: RaycastExtensionsProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [actionsOpen, setActionsOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [actionIndex, setActionIndex] = useState(0);
    const [menuIndex, setMenuIndex] = useState(0);
    const [panelQuery, setPanelQuery] = useState("");
    const [query, setQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const isFirstRender = useRef(true);

    const trimmedQuery = query.toLowerCase().trim();
    const matchesQuery = (text: string) =>
        text.toLowerCase().includes(trimmedQuery);

    const showConfetti =
        !trimmedQuery || matchesQuery("Confetti") || matchesQuery("Raycast");
    const visibleExtensions = trimmedQuery
        ? extensions.filter((extension) => matchesQuery(extension.title))
        : extensions;
    const visibleContributions = trimmedQuery
        ? contributionExtensions.filter((extension) =>
              matchesQuery(extension.title),
          )
        : contributionExtensions;

    // null represents the Confetti command
    const visibleItems: (Extension | null)[] = [
        ...(showConfetti ? [null] : []),
        ...visibleExtensions,
        ...visibleContributions,
    ];
    const totalItems = visibleItems.length;
    const extensionsOffset = showConfetti ? 1 : 0;
    const contributionsOffset = extensionsOffset + visibleExtensions.length;

    const selectedExtension = visibleItems[selectedIndex] ?? null;
    const selectedTitle = selectedExtension?.title ?? "Confetti";

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

    const openSelectedItem = useCallback(
        (index: number) => {
            const item = visibleItems[index];
            if (item === undefined) return;
            if (item === null) {
                handleConfettiAction();
            } else if (item.store_url) {
                window.open(item.store_url, "_blank");
            }
        },
        [visibleItems, handleConfettiAction],
    );

    // Keep the selection valid when the search results shrink
    useEffect(() => {
        if (selectedIndex >= totalItems && totalItems > 0) {
            setSelectedIndex(0);
        }
    }, [selectedIndex, totalItems]);

    const openLink = (url: string) => {
        window.open(url, "_blank");
    };

    const actionItems: PanelItem[] = selectedExtension
        ? [
              {
                  label: "Open Extension",
                  icon: SquareArrowOutUpRight,
                  keys: ["↵"],
                  run: () => openLink(selectedExtension.store_url),
              },
              {
                  label: "Copy Store URL",
                  icon: Clipboard,
                  keys: ["⌘", "C"],
                  run: () =>
                      navigator.clipboard?.writeText(
                          selectedExtension.store_url,
                      ),
              },
              {
                  label: "Copy Extension Name",
                  icon: Clipboard,
                  keys: ["⌘", "⇧", "C"],
                  run: () =>
                      navigator.clipboard?.writeText(selectedExtension.title),
              },
          ]
        : [
              {
                  label: "Run Command",
                  emoji: "🎉",
                  keys: ["↵"],
                  run: handleConfettiAction,
              },
              {
                  label: "Copy Command Name",
                  icon: Clipboard,
                  keys: ["⌘", "C"],
                  run: () => navigator.clipboard?.writeText("Confetti"),
              },
          ];

    const menuItems: PanelItem[] = [
        {
            label: "About Raycast",
            iconImg: "/raycast.svg",
            run: () => openLink("https://www.raycast.com"),
        },
        {
            label: "About Yen Cheng",
            iconImg: "/yencheng.png",
            run: () => openLink("https://yencheng.dev"),
        },
    ];

    const closePanels = useCallback(() => {
        setActionsOpen(false);
        setMenuOpen(false);
        setPanelQuery("");
    }, []);

    const filterItems = (items: PanelItem[]) =>
        panelQuery
            ? items.filter((item) =>
                  item.label
                      .toLowerCase()
                      .includes(panelQuery.toLowerCase().trim()),
              )
            : items;
    const visibleActionItems = filterItems(actionItems);
    const visibleMenuItems = filterItems(menuItems);
    const menuPanelHeight = Math.min(
        280,
        PANEL_CHROME_HEIGHT + Math.max(36, visibleMenuItems.length * 36),
    );
    const actionPanelHeight = Math.min(
        280,
        PANEL_CHROME_HEIGHT + Math.max(36, visibleActionItems.length * 36),
    );

    // Close the panels when clicking outside the launcher window
    useEffect(() => {
        if (!actionsOpen && !menuOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                closePanels();
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
        };
    }, [actionsOpen, menuOpen, closePanels]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Only handle keyboard events when the component is visible
            if (!isVisible) return;

            const meta = event.metaKey || event.ctrlKey;

            if (actionsOpen || menuOpen) {
                const fullItems = actionsOpen ? actionItems : menuItems;
                const items = actionsOpen
                    ? visibleActionItems
                    : visibleMenuItems;
                const index = actionsOpen ? actionIndex : menuIndex;
                const setIndex = actionsOpen ? setActionIndex : setMenuIndex;

                if (event.key === "Escape") {
                    event.preventDefault();
                    closePanels();
                } else if (meta && event.key.toLowerCase() === "k") {
                    event.preventDefault();
                    closePanels();
                } else if (event.key === "ArrowDown") {
                    event.preventDefault();
                    if (items.length > 0) {
                        setIndex((prev) => (prev + 1) % items.length);
                    }
                } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    if (items.length > 0) {
                        setIndex((prev) =>
                            prev === 0 ? items.length - 1 : prev - 1,
                        );
                    }
                } else if (event.key === "Enter") {
                    event.preventDefault();
                    items[index]?.run();
                    closePanels();
                } else if (meta && event.key.toLowerCase() === "c") {
                    const copyItem = fullItems.find(
                        (item) => item.keys?.[1] === "C",
                    );
                    if (copyItem) {
                        event.preventDefault();
                        copyItem.run();
                        closePanels();
                    }
                }
                return;
            }

            if (meta && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setActionIndex(0);
                setActionsOpen(true);
            } else if (meta && event.key === "/") {
                event.preventDefault();
                setMenuIndex(0);
                setMenuOpen(true);
            } else if (event.key === "ArrowDown") {
                event.preventDefault();
                if (totalItems > 0) {
                    setSelectedIndex((prev) => (prev + 1) % totalItems);
                }
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                if (totalItems > 0) {
                    setSelectedIndex((prev) =>
                        prev === 0 ? totalItems - 1 : prev - 1,
                    );
                }
            } else if (event.key === "Enter") {
                event.preventDefault();
                openSelectedItem(selectedIndex);
            } else if (event.key === "Escape") {
                if (query) {
                    event.preventDefault();
                    setQuery("");
                    setSelectedIndex(0);
                }
            } else if (
                !(event.target instanceof HTMLInputElement) &&
                (event.key === "Backspace" ||
                    (!meta && !event.altKey && event.key.length === 1))
            ) {
                // Type-anywhere: focus the search bar so the keystroke lands in it
                searchInputRef.current?.focus();
            }
        },
        [
            isVisible,
            actionsOpen,
            menuOpen,
            actionItems,
            menuItems,
            visibleActionItems,
            visibleMenuItems,
            actionIndex,
            menuIndex,
            selectedIndex,
            totalItems,
            query,
            openSelectedItem,
            closePanels,
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
        openSelectedItem(index);
    };

    const renderPanelItem = (
        item: PanelItem,
        index: number,
        activeIndex: number,
        setActiveIndex: (index: number) => void,
    ) => (
        <div
            data-testid="raycast-panel-item"
            key={item.label}
            onClick={() => {
                item.run();
                closePanels();
            }}
            onMouseEnter={() => setActiveIndex(index)}
            className={cn(
                "flex h-9 cursor-pointer items-center gap-x-2 rounded-[12px] pr-2 pl-1.5",
                index === activeIndex && "bg-white-black-900/10",
            )}
        >
            {item.icon && (
                <item.icon
                    size={16}
                    className="text-white-black-800 shrink-0"
                />
            )}
            {item.emoji && (
                <span className="flex w-4 shrink-0 justify-center text-[15px] leading-none">
                    {item.emoji}
                </span>
            )}
            {item.iconImg && (
                <img
                    src={item.iconImg}
                    width={16}
                    height={16}
                    alt={item.label}
                    className="shrink-0"
                ></img>
            )}
            <span className="truncate text-[15px] font-medium">
                {item.label}
            </span>
            {item.keys && <PanelKeycaps keys={item.keys} />}
        </div>
    );

    const panelSearchFooter = (
        <div className="border-white-black-900/10 flex h-10 items-center border-t px-[15px]">
            <input
                autoFocus
                type="text"
                value={panelQuery}
                onChange={(event) => {
                    setPanelQuery(event.target.value);
                    setActionIndex(0);
                    setMenuIndex(0);
                }}
                placeholder="Search for actions..."
                className="placeholder:text-white-black-400 caret-white-black-900 w-full bg-transparent text-[14px] outline-none"
            />
        </div>
    );

    return (
        <div
            ref={containerRef}
            data-testid="raycast-window"
            className="border-white-brown-600 bg-white-brown-500 text-white-black-900 relative flex h-[472px] w-[96%] flex-col overflow-hidden rounded-[26px] border font-sans shadow-[0_30px_70px_rgba(0,0,0,0.24),0_8px_20px_rgba(0,0,0,0.10)] select-none md:w-[750px]"
        >
            <div className="flex h-[62px] shrink-0 items-center gap-x-3.5 px-4">
                <img
                    src="/raycast.svg"
                    width={23}
                    height={23}
                    alt="raycast icon"
                ></img>
                <div className="relative flex min-w-0 flex-1 items-center">
                    {query === "" && !searchFocused && (
                        <span className="raycast-caret bg-white-black-900 pointer-events-none absolute left-0 h-[22px] w-px rounded-full"></span>
                    )}
                    <input
                        data-testid="raycast-search-input"
                        ref={searchInputRef}
                        type="text"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setSelectedIndex(0);
                        }}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        placeholder="Search for apps and commands…"
                        className="placeholder:text-white-black-400 caret-white-black-900 w-full bg-transparent text-[18px] outline-none"
                    />
                </div>
                <a
                    href="https://raycast.com/ridemountainpig"
                    target="_blank"
                    rel="noreferrer"
                    className="flex shrink-0 items-center gap-x-2.5"
                >
                    <span className="text-white-black-500 hidden text-[14px] sm:block">
                        Open My Raycast Profile
                    </span>
                    <span
                        className="border-white-black-900/10 text-white-black-600 hidden size-[22px] items-center justify-center rounded-[7px] border bg-transparent sm:flex"
                        data-testid="raycast-profile-icon-keycap"
                        title="Tab"
                    >
                        <ArrowRightToLine
                            size={12}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                    </span>
                    <SquareArrowOutUpRight
                        size={16}
                        strokeWidth={2.5}
                        className="text-white-black-500 sm:hidden"
                    />
                </a>
            </div>
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-2 pb-14">
                {totalItems === 0 ? (
                    <div className="text-white-black-400 flex h-full items-center justify-center pb-6 text-[15px]">
                        No Results
                    </div>
                ) : (
                    <>
                        {showConfetti && (
                            <>
                                <div className="px-2.5">
                                    <span className="text-white-black-500 text-[13px]">
                                        Favorites
                                    </span>
                                </div>
                                <div>
                                    <div
                                        ref={(el) => {
                                            itemRefs.current[0] = el;
                                        }}
                                        onClick={() => handleItemClick(0)}
                                    >
                                        <RaycastConfettiItem
                                            isSelected={selectedIndex === 0}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        {visibleExtensions.length > 0 && (
                            <>
                                <div
                                    className={cn(
                                        "px-2.5",
                                        showConfetti ? "pt-3" : "pt-0.5",
                                    )}
                                >
                                    <span className="text-white-black-500 text-[13px]">
                                        My Extensions
                                    </span>
                                </div>
                                <div className="pt-1.5">
                                    {visibleExtensions.map(
                                        (extension, index) => {
                                            const globalIndex =
                                                extensionsOffset + index;
                                            return (
                                                <div
                                                    key={
                                                        "MyExtensions" +
                                                        extension.title
                                                    }
                                                    ref={(el) => {
                                                        itemRefs.current[
                                                            globalIndex
                                                        ] = el;
                                                    }}
                                                    onClick={() =>
                                                        handleItemClick(
                                                            globalIndex,
                                                        )
                                                    }
                                                >
                                                    <RaycastExtItem
                                                        extension={extension}
                                                        isSelected={
                                                            selectedIndex ===
                                                            globalIndex
                                                        }
                                                    />
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </>
                        )}
                        {visibleContributions.length > 0 && (
                            <>
                                <div
                                    className={cn(
                                        "px-2.5",
                                        showConfetti ||
                                            visibleExtensions.length > 0
                                            ? "pt-3"
                                            : "pt-0.5",
                                    )}
                                >
                                    <span className="text-white-black-500 text-[13px]">
                                        My Contributions Extensions
                                    </span>
                                </div>
                                <div className="pt-1.5">
                                    {visibleContributions.map(
                                        (extension, index) => {
                                            const globalIndex =
                                                contributionsOffset + index;
                                            return (
                                                <div
                                                    key={
                                                        "MyContributionsExtensions" +
                                                        extension.title
                                                    }
                                                    ref={(el) => {
                                                        itemRefs.current[
                                                            globalIndex
                                                        ] = el;
                                                    }}
                                                    onClick={() =>
                                                        handleItemClick(
                                                            globalIndex,
                                                        )
                                                    }
                                                >
                                                    <RaycastExtItem
                                                        extension={extension}
                                                        isSelected={
                                                            selectedIndex ===
                                                            globalIndex
                                                        }
                                                    />
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
            <div className="from-white-brown-500 via-white-brown-500/80 pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent"></div>
            {(actionsOpen || menuOpen) && (
                <div
                    className="absolute inset-0 z-10"
                    onClick={closePanels}
                ></div>
            )}
            <button
                data-testid="raycast-menu-button"
                type="button"
                onClick={() => {
                    setMenuIndex(0);
                    setPanelQuery("");
                    setActionsOpen(false);
                    setMenuOpen(!menuOpen);
                }}
                title="⌘ /"
                className="group border-white-black-900/10 bg-white-brown-50 absolute bottom-[7px] left-[7px] flex size-9 cursor-pointer items-center justify-center rounded-full border shadow-[0_8px_24px_rgba(0,0,0,0.13),0_2px_6px_rgba(0,0,0,0.05)]"
            >
                <span
                    data-testid="raycast-menu-hover-surface"
                    className="group-hover:bg-white-black-900/5 flex size-[30px] items-center justify-center rounded-full"
                >
                    <img
                        src="/raycast.svg"
                        width={18}
                        height={18}
                        alt="raycast icon"
                    ></img>
                </span>
            </button>
            <div
                data-testid="raycast-bottom-actions"
                className="border-white-black-900/10 bg-white-brown-50 absolute right-[7px] bottom-[7px] flex h-9 w-[249px] items-center gap-x-[1.25px] rounded-full border pr-[7px] pl-[10px] text-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.13),0_2px_6px_rgba(0,0,0,0.05)]"
            >
                <button
                    data-testid="raycast-open-button"
                    type="button"
                    onClick={() => openSelectedItem(selectedIndex)}
                    className="hover:bg-white-black-900/5 -mr-0.5 -ml-[6.5px] flex h-[30px] shrink-0 cursor-pointer items-center gap-x-2 rounded-full pr-[7.5px] pl-[9.5px]"
                >
                    <span className="text-white-black-900 shrink-0 leading-[18px] font-medium">
                        {selectedExtension ? "Open Extension" : "Open Command"}
                    </span>
                    <span className="border-white-black-900/25 bg-white-brown-50 text-white-black-700 flex size-[18px] shrink-0 items-center justify-center rounded-[7px] border text-[11px] leading-none">
                        ↵
                    </span>
                </button>
                <button
                    data-testid="raycast-actions-button"
                    type="button"
                    onClick={() => {
                        setActionIndex(0);
                        setPanelQuery("");
                        setMenuOpen(false);
                        setActionsOpen(!actionsOpen);
                    }}
                    className="hover:bg-white-black-900/5 flex h-[30px] shrink-0 cursor-pointer items-center rounded-full pr-[6px] pl-[9.5px]"
                >
                    <span className="text-white-black-700 text-[12.5px] leading-[18px]">
                        Actions
                    </span>
                    <span className="border-white-black-900/25 bg-white-brown-50 text-white-black-700 relative right-[0.5px] ml-2 flex size-[18px] shrink-0 items-center justify-center rounded-[7px] border text-[11px] leading-none">
                        ⌘
                    </span>
                    <span className="border-white-black-900/25 bg-white-brown-50 text-white-black-700 relative right-[0.5px] ml-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[7px] border text-[11px] leading-none">
                        K
                    </span>
                </button>
            </div>
            {menuOpen && (
                <PanelShell
                    side="left"
                    title="Raycast Extensions by Yen Cheng"
                    footer={panelSearchFooter}
                    height={menuPanelHeight}
                >
                    {visibleMenuItems.length === 0 ? (
                        <div className="text-white-black-400 flex h-full items-center justify-center text-[15px]">
                            No Results
                        </div>
                    ) : (
                        visibleMenuItems.map((item, index) =>
                            renderPanelItem(
                                item,
                                index,
                                menuIndex,
                                setMenuIndex,
                            ),
                        )
                    )}
                </PanelShell>
            )}
            {actionsOpen && (
                <PanelShell
                    side="right"
                    title={selectedTitle}
                    footer={panelSearchFooter}
                    height={actionPanelHeight}
                >
                    {visibleActionItems.length === 0 ? (
                        <div className="text-white-black-400 flex h-full items-center justify-center text-[15px]">
                            No Results
                        </div>
                    ) : (
                        visibleActionItems.map((item, index) =>
                            renderPanelItem(
                                item,
                                index,
                                actionIndex,
                                setActionIndex,
                            ),
                        )
                    )}
                </PanelShell>
            )}
        </div>
    );
}
