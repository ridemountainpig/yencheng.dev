"use client";

import { geoMercator, geoPath } from "d3-geo";
import { ImageIcon, MapPin, Music2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { Polygon } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";

import PageTitle from "@/components/page-title";
import { useLiveShowPreview } from "@/components/live-show-preview";
import LiveShowImageDialog from "@/components/live-show-image-dialog";
import {
    LIVE_DASHBOARD,
    type LiveShowEvent,
    type LiveVenue,
} from "@/components/live-data";
import { cn } from "@/lib/utils";
import taiwanTopologyJson from "@/public/live/taiwan-counties.topo.json";

const DESKTOP_PANEL_HEIGHT_CLASS = "lg:h-[min(38rem,72svh)]";
const FULL_MAP_VIEWBOX = [360, 24, 480, 712] as const;
const OFFSHORE_COUNTIES = new Set(["09007", "09020", "10016"]);
const TAIWAN_MAIN_BOUNDS: Polygon = {
    type: "Polygon",
    coordinates: [
        [
            [119.98, 21.88],
            [119.98, 25.32],
            [122.05, 25.32],
            [122.05, 21.88],
            [119.98, 21.88],
        ],
    ],
};

type CountyProperties = {
    id: string;
    name: string;
};

type TaiwanTopology = Topology<{
    map: GeometryCollection<CountyProperties>;
}>;

type VenuePoint = LiveVenue & {
    anchorPoint: [number, number];
    point: [number, number];
};

const VENUE_MARKER_MIN_SPACING = 40;

const projection = geoMercator().fitExtent(
    [
        [470, 44],
        [790, 716],
    ],
    TAIWAN_MAIN_BOUNDS,
);

const topology = taiwanTopologyJson as unknown as TaiwanTopology;
const countyCollection = feature<CountyProperties>(
    topology,
    topology.objects.map,
);
const countyPath = geoPath(projection);
const COUNTY_PATHS = countyCollection.features
    .filter((county) => !OFFSHORE_COUNTIES.has(county.properties.id))
    .map((county) => ({
        id: county.properties.id,
        name: county.properties.name,
        path: countyPath(county),
    }))
    .filter(
        (county): county is typeof county & { path: string } =>
            county.path != null,
    );

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
});

type TicketStat = {
    label: string;
    value: string;
    detail: string;
    compact: boolean;
    venueId?: string;
};

const LIVE_YEARS = Array.from(
    new Set(LIVE_DASHBOARD.events.map(({ show }) => show.date.slice(0, 4))),
).sort();
const LIVE_YEAR_RANGE =
    LIVE_YEARS.length === 0
        ? "—"
        : LIVE_YEARS.length === 1
          ? LIVE_YEARS[0]
          : `${LIVE_YEARS[0]}—${LIVE_YEARS.at(-1)}`;
const TOP_VENUE = LIVE_DASHBOARD.venues.reduce<LiveVenue | null>(
    (currentTop, venue) => {
        if (!currentTop) {
            return venue;
        }

        const currentCount =
            LIVE_DASHBOARD.showCountByVenue.get(currentTop.id) ?? 0;
        const venueCount = LIVE_DASHBOARD.showCountByVenue.get(venue.id) ?? 0;
        return venueCount > currentCount ? venue : currentTop;
    },
    null,
);
const TOP_VENUE_SHOWS = TOP_VENUE
    ? (LIVE_DASHBOARD.showCountByVenue.get(TOP_VENUE.id) ?? 0)
    : 0;
const TICKET_STATS: TicketStat[] = [
    {
        label: "Shows",
        value: LIVE_DASHBOARD.totalShows.toLocaleString("en-US"),
        detail: "Live archive",
        compact: false,
    },
    {
        label: "Top Venue",
        value: TOP_VENUE?.name ?? "—",
        detail: `${TOP_VENUE_SHOWS} visit${TOP_VENUE_SHOWS === 1 ? "" : "s"}`,
        compact: true,
        venueId: TOP_VENUE?.id,
    },
    {
        label: "Years",
        value: LIVE_YEAR_RANGE,
        detail: `${LIVE_YEARS.length} year${LIVE_YEARS.length === 1 ? "" : "s"}`,
        compact: true,
    },
    {
        label: "Cities",
        value: LIVE_DASHBOARD.citiesVisited.toLocaleString("en-US"),
        detail: "Across Taiwan",
        compact: false,
    },
];

function projectVenue(venue: LiveVenue): VenuePoint | null {
    const [latitude, longitude] = venue.coordinates;
    const point = projection([longitude, latitude]);
    if (!point) {
        return null;
    }

    return { ...venue, anchorPoint: point, point };
}

function getPointDistance(first: [number, number], second: [number, number]) {
    return Math.hypot(first[0] - second[0], first[1] - second[1]);
}

function layoutVenuePoints(venues: LiveVenue[]) {
    const points = venues
        .map(projectVenue)
        .filter((venue) => venue != null)
        .map((venue) => ({ ...venue }));
    const visited = new Set<number>();

    points.forEach((_, startingIndex) => {
        if (visited.has(startingIndex)) {
            return;
        }

        const groupIndices = [startingIndex];
        const queue = [startingIndex];
        visited.add(startingIndex);

        while (queue.length > 0) {
            const currentIndex = queue.shift();
            if (currentIndex == null) {
                continue;
            }

            points.forEach((candidate, candidateIndex) => {
                if (
                    visited.has(candidateIndex) ||
                    getPointDistance(
                        points[currentIndex].anchorPoint,
                        candidate.anchorPoint,
                    ) >= VENUE_MARKER_MIN_SPACING
                ) {
                    return;
                }

                visited.add(candidateIndex);
                groupIndices.push(candidateIndex);
                queue.push(candidateIndex);
            });
        }

        if (groupIndices.length === 1) {
            return;
        }

        const group = groupIndices
            .map((index) => points[index])
            .sort(
                (first, second) => first.anchorPoint[0] - second.anchorPoint[0],
            );
        const center: [number, number] = [
            group.reduce((sum, venue) => sum + venue.anchorPoint[0], 0) /
                group.length,
            group.reduce((sum, venue) => sum + venue.anchorPoint[1], 0) /
                group.length,
        ];

        if (group.length === 2) {
            const halfSpacing = VENUE_MARKER_MIN_SPACING / 2;
            group[0].point = [center[0] - halfSpacing, center[1]];
            group[1].point = [center[0] + halfSpacing, center[1]];
            return;
        }

        const radius = Math.max(
            VENUE_MARKER_MIN_SPACING / 2,
            (VENUE_MARKER_MIN_SPACING * group.length) / (2 * Math.PI),
        );
        group.forEach((venue, index) => {
            const angle = -Math.PI / 2 + (index / group.length) * Math.PI * 2;
            venue.point = [
                center[0] + Math.cos(angle) * radius,
                center[1] + Math.sin(angle) * radius,
            ];
        });
    });

    return points;
}

function getVenueViewBox(point: [number, number]) {
    const [x, y] = point;
    const width = 300;
    const height = 360;
    return [x - width / 2, y - height / 2, width, height] as const;
}

function formatViewBox(values: readonly number[]) {
    return values.map((value) => value.toFixed(2)).join(" ");
}

function useAnimatedViewBox(
    svgRef: React.RefObject<SVGSVGElement | null>,
    targetViewBox: readonly number[],
) {
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) {
            return;
        }

        const currentViewBox = (svg.getAttribute("viewBox") ?? "")
            .split(/\s+/)
            .map(Number);
        if (currentViewBox.length !== 4 || currentViewBox.some(Number.isNaN)) {
            svg.setAttribute("viewBox", formatViewBox(targetViewBox));
            return;
        }

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            svg.setAttribute("viewBox", formatViewBox(targetViewBox));
            return;
        }

        const startedAt = performance.now();
        const duration = 650;
        let frameId = 0;

        const frame = (now: number) => {
            const progress = Math.min((now - startedAt) / duration, 1);
            const eased = 1 - (1 - progress) ** 3;
            const nextViewBox = currentViewBox.map(
                (value, index) =>
                    value + (targetViewBox[index] - value) * eased,
            );

            svg.setAttribute("viewBox", formatViewBox(nextViewBox));
            if (progress < 1) {
                frameId = requestAnimationFrame(frame);
            }
        };

        frameId = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(frameId);
    }, [svgRef, targetViewBox]);
}

function TaiwanVenueMap({
    venues,
    selectedVenueId,
    onSelectVenue,
}: {
    venues: LiveVenue[];
    selectedVenueId: string | null;
    onSelectVenue: (venueId: string | null) => void;
}) {
    const svgRef = useRef<SVGSVGElement>(null);
    const venuePoints = useMemo(() => layoutVenuePoints(venues), [venues]);
    const selectedPoint = venuePoints.find(
        (venue) => venue.id === selectedVenueId,
    );
    const targetViewBox = useMemo(
        () =>
            selectedPoint
                ? getVenueViewBox(selectedPoint.point)
                : FULL_MAP_VIEWBOX,
        [selectedPoint],
    );

    useAnimatedViewBox(svgRef, targetViewBox);

    return (
        <div className="bg-white-brown-300 relative h-full w-full overflow-hidden">
            <svg
                ref={svgRef}
                viewBox={formatViewBox(FULL_MAP_VIEWBOX)}
                className="h-full w-full"
                role="img"
                aria-label="Taiwan map with visited live show venues"
                onClick={() => onSelectVenue(null)}
            >
                <defs>
                    <pattern
                        id="live-map-grid"
                        width="24"
                        height="24"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M24 0H0V24"
                            fill="none"
                            stroke="#916651"
                            strokeOpacity="0.07"
                            strokeWidth="1"
                        />
                    </pattern>
                    <filter
                        id="live-island-shadow"
                        x="-40%"
                        y="-30%"
                        width="180%"
                        height="180%"
                    >
                        <feDropShadow
                            dx="0"
                            dy="10"
                            stdDeviation="12"
                            floodColor="#472013"
                            floodOpacity="0.12"
                        />
                    </filter>
                    <radialGradient id="live-map-glow">
                        <stop offset="0" stopColor="#f2e9e3" />
                        <stop offset="1" stopColor="#faf8f5" />
                    </radialGradient>
                </defs>

                <rect
                    x="-200"
                    y="-200"
                    width="1400"
                    height="1200"
                    fill="url(#live-map-glow)"
                />
                <rect
                    x="-200"
                    y="-200"
                    width="1400"
                    height="1200"
                    fill="url(#live-map-grid)"
                />

                <g
                    filter="url(#live-island-shadow)"
                    className={cn(
                        "transition-opacity duration-300",
                        selectedVenueId && "opacity-55",
                    )}
                >
                    {COUNTY_PATHS.map((county) => (
                        <path
                            key={county.id}
                            d={county.path}
                            aria-label={county.name}
                            className="fill-white-brown-400 stroke-white-brown-600"
                            strokeWidth="1.5"
                            vectorEffect="non-scaling-stroke"
                        />
                    ))}
                </g>

                <g>
                    {venuePoints.map((venue) => {
                        const [x, y] = venue.point;
                        const selected = venue.id === selectedVenueId;
                        const showCount =
                            LIVE_DASHBOARD.showCountByVenue.get(venue.id) ?? 0;

                        return (
                            <g
                                key={venue.id}
                                role="button"
                                tabIndex={0}
                                aria-label={`${venue.name}, ${showCount} live show${showCount === 1 ? "" : "s"}`}
                                aria-pressed={selected}
                                className={cn(
                                    "group cursor-pointer transition-opacity duration-300 outline-none",
                                    selectedVenueId &&
                                        !selected &&
                                        "opacity-35",
                                )}
                                transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onSelectVenue(venue.id);
                                }}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" ||
                                        event.key === " "
                                    ) {
                                        event.preventDefault();
                                        onSelectVenue(venue.id);
                                    }
                                }}
                            >
                                <circle r="20" fill="transparent" />
                                {selected && (
                                    <circle
                                        r="15"
                                        className="fill-white-brown-700/30 animate-ping"
                                    />
                                )}
                                <circle
                                    r={selected ? 10 : 7}
                                    className={cn(
                                        "stroke-white-brown-100 group-hover:r-[10px] group-focus:r-[10px] transition-all duration-200",
                                        selected
                                            ? "fill-white-brown-900"
                                            : "fill-white-brown-800",
                                    )}
                                    strokeWidth="3"
                                    vectorEffect="non-scaling-stroke"
                                />
                                <text
                                    y={selected ? -18 : -14}
                                    textAnchor="middle"
                                    className={cn(
                                        "fill-white-brown-950 font-nunito text-[12px] font-bold transition-opacity duration-200",
                                        selected
                                            ? "opacity-100"
                                            : "opacity-0 group-hover:opacity-100 group-focus:opacity-100",
                                    )}
                                    style={{
                                        paintOrder: "stroke",
                                        stroke: "#faf8f5",
                                        strokeWidth: 5,
                                        strokeLinejoin: "round",
                                    }}
                                >
                                    {venue.name}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>

            {venues.length === 0 && (
                <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-center">
                    <p className="border-white-brown-600/70 bg-white-brown-100/90 text-white-brown-900 font-nunito rounded-full border px-4 py-2 text-xs shadow-sm backdrop-blur-sm">
                        No venues logged yet
                    </p>
                </div>
            )}
        </div>
    );
}

function ShowDate({ date }: { date: string }) {
    const parts = DATE_FORMATTER.formatToParts(
        new Date(`${date}T00:00:00.000Z`),
    );
    const month = parts.find((part) => part.type === "month")?.value ?? "";
    const day = parts.find((part) => part.type === "day")?.value ?? "";
    const year = parts.find((part) => part.type === "year")?.value ?? "";

    return (
        <time
            dateTime={date}
            className="border-white-brown-600 bg-white-brown-400 text-white-brown-900 font-nunito flex w-14 shrink-0 flex-col items-center rounded-xl border px-2 py-2 leading-none"
        >
            <span className="text-[10px] tracking-widest uppercase">
                {month}
            </span>
            <span className="my-1 text-xl font-bold">{day}</span>
            <span className="text-[10px]">{year}</span>
        </time>
    );
}

function TimelineItem({
    event,
    latest,
    active,
    onSelect,
    previewProps,
    onViewImage,
}: {
    event: LiveShowEvent;
    latest: boolean;
    active: boolean;
    onSelect: () => void;
    onViewImage: () => void;
    previewProps: ReturnType<
        ReturnType<typeof useLiveShowPreview>["getTriggerProps"]
    >;
}) {
    return (
        <div className="relative">
            <button
                {...previewProps}
                type="button"
                onClick={onSelect}
                aria-pressed={active}
                className={cn(
                    "border-white-brown-600/70 focus-visible:outline-white-brown-800 flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2",
                    event.show.image && "pr-14",
                    active
                        ? "bg-white-brown-500 border-white-brown-700 shadow-sm"
                        : "bg-white-brown-300/80 hover:bg-white-brown-500/90",
                )}
            >
                <ShowDate date={event.show.date} />
                <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                        <span className="text-white-brown-950 font-nunito text-sm font-bold">
                            {event.show.artist}
                        </span>
                        {latest && (
                            <span className="bg-white-brown-700 text-white-brown-100 font-nunito shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                                Latest
                            </span>
                        )}
                    </span>
                    <span className="text-white-black-800 font-nunito mt-1 block text-sm">
                        {event.show.title}
                    </span>
                    <span className="text-white-brown-800 font-nunito mt-2 flex items-center gap-1.5 text-xs">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">
                            {event.venue.name} · {event.venue.city}
                        </span>
                    </span>
                    {event.show.note && (
                        <span className="text-white-black-600 font-nunito mt-2 block text-xs leading-relaxed">
                            {event.show.note}
                        </span>
                    )}
                </span>
            </button>
            {event.show.image && (
                <button
                    type="button"
                    aria-label={`View image: ${event.show.artist} ${event.show.date}`}
                    aria-haspopup="dialog"
                    onClick={onViewImage}
                    className="text-white-brown-800 hover:bg-white-brown-500 focus-visible:outline-white-brown-800 absolute right-1.5 bottom-1.5 flex size-11 items-center justify-center rounded-xl transition-colors focus-visible:outline-2"
                >
                    <ImageIcon className="size-5" aria-hidden="true" />
                </button>
            )}
        </div>
    );
}

export default function Live() {
    const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
    const [imageEvent, setImageEvent] = useState<LiveShowEvent | null>(null);
    const { getTriggerProps, timelineProps, close, preview } =
        useLiveShowPreview(LIVE_DASHBOARD.events);
    const selectedVenue = LIVE_DASHBOARD.venues.find(
        (venue) => venue.id === selectedVenueId,
    );
    const visibleEvents = selectedVenueId
        ? LIVE_DASHBOARD.events.filter(
              ({ venue }) => venue.id === selectedVenueId,
          )
        : LIVE_DASHBOARD.events;
    const timelineGroups = visibleEvents.reduce<
        Array<{ year: string; events: LiveShowEvent[] }>
    >((groups, event) => {
        const year = event.show.date.slice(0, 4);
        const latestGroup = groups.at(-1);

        if (latestGroup?.year === year) {
            latestGroup.events.push(event);
        } else {
            groups.push({ year, events: [event] });
        }

        return groups;
    }, []);
    const latestShowKey = LIVE_DASHBOARD.events[0]?.key;

    return (
        <div className="text-white-black-900 bg-white-black-50 flex h-full min-h-0 w-full flex-col pt-6">
            <PageTitle title="My Live Shows" />
            <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-10 sm:px-8">
                <div className="mx-auto mt-4 grid w-full max-w-6xl gap-5 sm:mt-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-stretch">
                    <div
                        data-carousel-no-drag
                        className={cn(
                            "border-white-brown-600/60 relative mx-auto h-[25rem] w-full overflow-hidden rounded-2xl border shadow-md sm:h-[32rem] lg:max-w-none",
                            DESKTOP_PANEL_HEIGHT_CLASS,
                        )}
                    >
                        <TaiwanVenueMap
                            venues={LIVE_DASHBOARD.venues}
                            selectedVenueId={selectedVenueId}
                            onSelectVenue={setSelectedVenueId}
                        />
                    </div>

                    <div
                        data-carousel-no-drag
                        className={cn(
                            "border-white-brown-600/70 bg-white-brown-100/90 flex h-[30rem] min-h-0 flex-col overflow-hidden rounded-2xl border shadow-sm",
                            DESKTOP_PANEL_HEIGHT_CLASS,
                        )}
                    >
                        <div className="border-white-brown-600/70 flex min-h-[4.25rem] items-center justify-between gap-3 border-b px-4 py-3">
                            <div className="min-w-0" aria-live="polite">
                                <p className="text-white-brown-900 font-nunito truncate text-sm font-bold tracking-wide">
                                    {selectedVenue?.name ??
                                        "Live Show Timeline"}
                                </p>
                                <p className="text-white-brown-800 font-nunito text-xs">
                                    {selectedVenue
                                        ? `${visibleEvents.length} show${visibleEvents.length === 1 ? "" : "s"} · ${selectedVenue.city}`
                                        : "Click a venue to filter the timeline."}
                                </p>
                            </div>
                            {selectedVenue && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedVenueId(null)}
                                    className="border-white-brown-600 text-white-brown-900 hover:bg-white-brown-400 shrink-0 rounded-full border p-2 transition-colors"
                                    aria-label="Clear venue selection"
                                    title="Clear venue selection"
                                >
                                    <X className="size-4" aria-hidden="true" />
                                </button>
                            )}
                        </div>

                        <div
                            {...timelineProps}
                            className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3"
                        >
                            {visibleEvents.length > 0 ? (
                                timelineGroups.map(({ year, events }) => (
                                    <section
                                        key={year}
                                        className="flex flex-col gap-3"
                                        aria-labelledby={`live-shows-${year}`}
                                    >
                                        <div className="flex items-center gap-3 px-1 py-1">
                                            <h3
                                                id={`live-shows-${year}`}
                                                className="text-white-brown-950 font-nunito text-lg font-bold tracking-tight"
                                            >
                                                {year}
                                            </h3>
                                            <span className="bg-white-brown-600/70 h-px flex-1" />
                                            <span className="text-white-brown-700 font-nunito text-[10px] tracking-wider uppercase">
                                                {events.length} show
                                                {events.length === 1 ? "" : "s"}
                                            </span>
                                        </div>

                                        {events.map((event) => (
                                            <TimelineItem
                                                key={event.key}
                                                event={event}
                                                onViewImage={() => {
                                                    close();
                                                    setImageEvent(event);
                                                }}
                                                previewProps={getTriggerProps(
                                                    event,
                                                )}
                                                latest={
                                                    event.key === latestShowKey
                                                }
                                                active={
                                                    event.venue.id ===
                                                    selectedVenueId
                                                }
                                                onSelect={() => {
                                                    close();
                                                    setSelectedVenueId(
                                                        event.venue.id,
                                                    );
                                                }}
                                            />
                                        ))}
                                    </section>
                                ))
                            ) : (
                                <div className="text-white-brown-800 flex min-h-64 flex-1 flex-col items-center justify-center px-6 text-center">
                                    <span className="bg-white-brown-400 mb-3 rounded-full p-3">
                                        <Music2 className="size-5" />
                                    </span>
                                    <p className="font-nunito text-sm font-bold">
                                        No live shows logged yet
                                    </p>
                                    <p className="font-nunito mt-1 max-w-48 text-xs leading-relaxed">
                                        Your live show timeline will appear
                                        here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-4xl">
                    <span
                        aria-hidden="true"
                        className="bg-white-black-50 absolute top-1/2 -left-3 z-10 size-6 -translate-y-1/2 rounded-full"
                    />
                    <span
                        aria-hidden="true"
                        className="bg-white-black-50 absolute top-1/2 -right-3 z-10 size-6 -translate-y-1/2 rounded-full"
                    />

                    <div className="border-white-brown-600/70 bg-white-brown-100/90 overflow-hidden rounded-[1.4rem] border shadow-sm">
                        <div className="border-white-brown-600/70 text-white-brown-700 font-nunito flex items-center justify-between gap-4 border-b border-dashed px-5 py-2 text-[9px] font-bold tracking-[0.18em] uppercase sm:px-6">
                            <span>Yencheng Live Archive</span>
                            <span className="shrink-0">
                                Admit One · No.{" "}
                                {String(LIVE_DASHBOARD.totalShows).padStart(
                                    4,
                                    "0",
                                )}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-[0.7fr_1.45fr_1fr_0.7fr]">
                            {TICKET_STATS.map((stat, index) => {
                                const className = cn(
                                    "border-white-brown-600/60 flex min-h-24 flex-col justify-center gap-1 border-dashed px-5 py-4 text-left sm:min-h-28 sm:px-6",
                                    index === 0 &&
                                        "border-r border-b sm:border-b-0",
                                    index === 1 &&
                                        "border-b sm:border-r sm:border-b-0",
                                    index === 2 && "border-r",
                                    stat.venueId &&
                                        "hover:bg-white-brown-400/70 focus-visible:bg-white-brown-400/70 cursor-pointer transition-colors outline-none",
                                );
                                const content = (
                                    <>
                                        <span className="text-white-brown-700 font-nunito text-[9px] font-bold tracking-[0.16em] uppercase">
                                            {stat.label}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-white-black-900 font-nunito font-bold tracking-tight",
                                                stat.compact
                                                    ? "text-base leading-tight sm:text-lg"
                                                    : "text-3xl",
                                            )}
                                        >
                                            {stat.value}
                                        </span>
                                        <span className="text-white-black-600 font-nunito text-[10px] tracking-wide uppercase">
                                            {stat.detail}
                                        </span>
                                    </>
                                );

                                return stat.venueId ? (
                                    <button
                                        key={stat.label}
                                        type="button"
                                        className={className}
                                        aria-label={`Filter timeline to ${stat.value}`}
                                        aria-pressed={
                                            selectedVenueId === stat.venueId
                                        }
                                        onClick={() =>
                                            setSelectedVenueId(
                                                stat.venueId ?? null,
                                            )
                                        }
                                    >
                                        {content}
                                    </button>
                                ) : (
                                    <div key={stat.label} className={className}>
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            {preview}
            {imageEvent && (
                <LiveShowImageDialog
                    event={imageEvent}
                    onClose={() => setImageEvent(null)}
                />
            )}
        </div>
    );
}
