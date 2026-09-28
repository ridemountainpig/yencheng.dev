"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowLeftRight, ArrowRight } from "lucide-react";

import { KM_TO_MI, type FlightLogRow } from "@/components/travel-data";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
/** Rows start flipping top to bottom, this far apart. */
const ROW_STAGGER_MS = 80;
/** Tiles within a row start this far apart, left to right. */
const TILE_STAGGER_MS = 30;
/** How long a tile spins through glyphs before it lands. */
const SPIN_MS = 380;
/** A new glyph drops in every step while spinning. */
const STEP_MS = 50;
const SETTLE_MS = 90;
/** Clock value for "armed": every tile blank, waiting to flip. */
const ARMED = -1;

type ColumnKey = "number" | "from" | "trip" | "to" | "miles";

const COLUMNS: { key: ColumnKey; label: string }[] = [
    { key: "number", label: "No" },
    { key: "from", label: "From" },
    { key: "trip", label: "" },
    { key: "to", label: "To" },
    { key: "miles", label: "Mi" },
];

/** The direction tile is wider so its arrow icon reads at small sizes. */
const WIDE_TILE_SCALE = 1.5;

/** Trip-direction glyphs land as icons: text arrows render too thin. */
const DIRECTION_ICONS = {
    "↔": ArrowLeftRight,
    "→": ArrowRight,
} as const;

function hashStep(seed: number, step: number): number {
    let h = Math.imul(seed, 374761393) + Math.imul(step, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
}

function formatMiles(row: FlightLogRow): string {
    if (row.distanceKm == null) {
        return "";
    }
    return Math.round(row.distanceKm * KM_TO_MI).toLocaleString("en-US");
}

function rowCells(
    row: FlightLogRow,
    milesWidth: number,
): Record<ColumnKey, string> {
    return {
        number: String(row.number).padStart(2, "0"),
        from: row.from.padEnd(3).slice(0, 3),
        trip: row.tripType === "round-trip" ? "↔" : "→",
        to: row.to.padEnd(3).slice(0, 3),
        miles: formatMiles(row).padStart(milesWidth),
    };
}

function describeRow(row: FlightLogRow): string {
    const parts = [
        `${row.number}. ${row.fromLabel} (${row.from}) to ${row.toLabel} (${row.to})`,
        row.tripType === "round-trip" ? "round trip" : "one way",
    ];
    const miles = formatMiles(row);
    if (miles) {
        parts.push(`${miles} miles`);
    }
    if (row.latest) {
        parts.push("latest");
    }
    return parts.join(", ");
}

function prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Starts blank (so the board never flashes its final text), then runs a
 * one-shot clock the first time it's in view. `null` means "final text".
 */
function useFlapClock(
    ref: RefObject<HTMLElement | null>,
    durationMs: number,
): number | null {
    const [clock, setClock] = useState<number | null>(ARMED);

    useEffect(() => {
        const element = ref.current;
        if (!element || prefersReducedMotion()) {
            const frameId = requestAnimationFrame(() => setClock(null));
            return () => cancelAnimationFrame(frameId);
        }

        let frameId = 0;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    return;
                }
                observer.disconnect();

                const startedAt = performance.now();
                const frame = (now: number) => {
                    const elapsed = now - startedAt;
                    if (elapsed >= durationMs) {
                        setClock(null);
                        return;
                    }
                    setClock(elapsed);
                    frameId = requestAnimationFrame(frame);
                };
                frameId = requestAnimationFrame(frame);
            },
            { threshold: 0.25 },
        );
        observer.observe(element);

        return () => {
            observer.disconnect();
            cancelAnimationFrame(frameId);
        };
    }, [ref, durationMs]);

    return clock;
}

function Flap({
    char,
    clock,
    start,
    seed,
    wide = false,
}: {
    char: string;
    clock: number | null;
    start: number;
    seed: number;
    wide?: boolean;
}) {
    let glyph = char;
    let squash = 1;

    if (clock !== null) {
        const t = clock - start;
        if (t < 0) {
            glyph = " ";
        } else if (t < SPIN_MS && char.trim()) {
            glyph =
                GLYPHS[hashStep(seed, Math.floor(t / STEP_MS)) % GLYPHS.length];
            squash = 0.7 + 0.3 * ((t % STEP_MS) / STEP_MS);
        } else if (t < SPIN_MS + SETTLE_MS) {
            squash = 0.8 + 0.2 * ((t - SPIN_MS) / SETTLE_MS);
        }
    }

    const Icon =
        glyph in DIRECTION_ICONS
            ? DIRECTION_ICONS[glyph as keyof typeof DIRECTION_ICONS]
            : null;

    return (
        <span
            className="relative flex h-[var(--flap-h)] items-center justify-center overflow-hidden rounded-[3px] bg-[#2b2420] shadow-[inset_0_-1px_0_rgba(0,0,0,0.4)] transition-colors group-hover:bg-[#352c27] group-aria-pressed:bg-[#3a2d22]"
            style={{
                width: `calc(var(--flap-w) * ${wide ? WIDE_TILE_SCALE : 1})`,
            }}
        >
            <span
                // Icons sit above the split line so the arrow stays crisp;
                // letters stay under it, like a real flap.
                className={cn("inline-flex", Icon && "relative z-10")}
                style={{ transform: `scaleY(${squash})` }}
            >
                {Icon ? (
                    <Icon
                        aria-hidden
                        strokeWidth={2.75}
                        className="size-[calc(var(--flap-h)*0.62)]"
                    />
                ) : glyph === " " ? (
                    "\u00a0"
                ) : (
                    glyph
                )}
            </span>
            <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/[0.07] to-transparent" />
            <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/70" />
        </span>
    );
}

function groupWidth(length: number, scale = 1): string {
    return `calc(var(--flap-w) * ${length * scale} + var(--flap-gap) * ${length - 1})`;
}

export default function FlightBoard({
    rows,
    selectedRouteKey,
    onSelectRoute,
    className,
}: {
    rows: FlightLogRow[];
    selectedRouteKey: string | null;
    onSelectRoute: (routeKey: string) => void;
    className?: string;
}) {
    const listRef = useRef<HTMLDivElement>(null);
    const milesWidth = Math.max(
        5,
        ...rows.map((row) => formatMiles(row).length),
    );
    const lengths: Record<ColumnKey, number> = {
        number: 2,
        from: 3,
        trip: 1,
        to: 3,
        miles: milesWidth,
    };
    const tilesPerRow = Object.values(lengths).reduce((sum, n) => sum + n, 0);
    const durationMs =
        (rows.length - 1) * ROW_STAGGER_MS +
        (tilesPerRow - 1) * TILE_STAGGER_MS +
        SPIN_MS +
        SETTLE_MS;
    const clock = useFlapClock(listRef, durationMs);

    // One lit row: the entry you tapped, or, when the route was picked on
    // the globe, the most recent trip on that route.
    const [tappedNumber, setTappedNumber] = useState<number | null>(null);
    const tappedRow = rows.find((row) => row.number === tappedNumber);
    const selectedNumber = !selectedRouteKey
        ? null
        : tappedRow?.routeKey === selectedRouteKey
          ? tappedRow.number
          : (rows.find((row) => row.routeKey === selectedRouteKey)?.number ??
            null);

    // A route picked on the globe may sit below the fold of the log: scroll
    // the log itself (never the page) so its row is in view.
    useEffect(() => {
        const list = listRef.current;
        const row = list?.querySelector<HTMLElement>(
            'button[aria-pressed="true"]',
        );
        if (!list || !row) {
            return;
        }
        const top = row.offsetTop;
        const bottom = top + row.offsetHeight;
        if (
            top >= list.scrollTop &&
            bottom <= list.scrollTop + list.clientHeight
        ) {
            return;
        }
        list.scrollTo({
            top: top - (list.clientHeight - row.offsetHeight) / 2,
            behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
    }, [selectedNumber]);

    return (
        <section
            aria-label="Flight log"
            data-carousel-no-drag
            className={cn(
                "@container flex min-h-0 flex-col overflow-hidden rounded-2xl border border-black/40 bg-[#1d1815] shadow-md",
                className,
            )}
        >
            <div className="shrink-0 border-b border-white/10 px-4 py-3">
                <div className="font-nunito flex items-center justify-between gap-3 text-xs tracking-[0.18em] uppercase">
                    <span className="text-[#e6d8cc]">Flight Log</span>
                    <span className="flex items-center gap-1.5 text-[10px] text-[#f2b35f]">
                        <span className="size-1.5 rounded-full bg-[#f2b35f]" />
                        Latest
                    </span>
                </div>
                <p className="font-nunito text-white-brown-700 mt-1 text-xs">
                    {rows.length} trips · Tap one to focus the globe.
                </p>
            </div>

            {/* Tile sizes follow the panel's width, not the viewport's. */}
            <div
                className={cn(
                    "flex min-h-0 flex-1 flex-col",
                    "[--flap-gap:2px] [--flap-h:1.5rem] [--flap-w:0.95rem] [--group-gap:0.4rem]",
                    "@xs:[--flap-h:1.6rem] @xs:[--flap-w:1.05rem] @xs:[--group-gap:0.55rem]",
                    "@sm:[--flap-h:1.85rem] @sm:[--flap-w:1.2rem] @sm:[--group-gap:0.8rem]",
                    "@lg:[--flap-gap:3px] @lg:[--flap-h:2.2rem] @lg:[--flap-w:1.45rem] @lg:[--group-gap:1rem]",
                )}
            >
                <div
                    aria-hidden
                    className="font-nunito text-white-brown-700 flex shrink-0 justify-between px-4 pt-3 pb-1 text-[10px] tracking-[0.2em] uppercase"
                >
                    {COLUMNS.map((column) => (
                        <span
                            key={column.key}
                            className={cn(
                                "shrink-0",
                                column.key === "miles" && "text-right",
                            )}
                            style={{
                                width: groupWidth(
                                    lengths[column.key],
                                    column.key === "trip" ? WIDE_TILE_SCALE : 1,
                                ),
                            }}
                        >
                            {column.label}
                        </span>
                    ))}
                </div>

                <div
                    ref={listRef}
                    className="no-scrollbar relative flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 pb-3"
                >
                    {rows.map((row, rowIndex) => {
                        const cells = rowCells(row, milesWidth);
                        const isSelected = row.number === selectedNumber;
                        let tileIndex = 0;

                        return (
                            <button
                                key={`${row.number}-${row.routeKey}`}
                                type="button"
                                onClick={() => {
                                    setTappedNumber(row.number);
                                    onSelectRoute(row.routeKey);
                                }}
                                aria-pressed={isSelected}
                                aria-label={describeRow(row)}
                                className={cn(
                                    "group flex w-full shrink-0 items-center justify-between rounded-lg px-2 py-1 text-left font-mono text-[length:calc(var(--flap-h)*0.52)] font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#f2b35f]",
                                    isSelected
                                        ? "bg-[#f2b35f]/10 text-[#f6c47e]"
                                        : row.latest
                                          ? "text-[#f2b35f]"
                                          : "text-[#f3ebe3]",
                                )}
                            >
                                {COLUMNS.map((column) => {
                                    const text = cells[column.key];
                                    const groupStart = tileIndex;
                                    tileIndex += text.length;

                                    return (
                                        <span
                                            key={column.key}
                                            aria-hidden
                                            className="flex shrink-0 gap-[var(--flap-gap)]"
                                        >
                                            {text.split("").map((char, i) => (
                                                <Flap
                                                    key={i}
                                                    char={char}
                                                    clock={clock}
                                                    start={
                                                        rowIndex *
                                                            ROW_STAGGER_MS +
                                                        (groupStart + i) *
                                                            TILE_STAGGER_MS
                                                    }
                                                    seed={
                                                        rowIndex * 64 +
                                                        groupStart +
                                                        i
                                                    }
                                                    wide={column.key === "trip"}
                                                />
                                            ))}
                                        </span>
                                    );
                                })}
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
