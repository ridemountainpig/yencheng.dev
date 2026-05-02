"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import PageTitle from "@/components/page-title";
import {
    FlightRoutes,
    getAirportInfo,
    resolveAirport,
    type AirportRef,
    type FlightRouteData,
} from "@/components/ui/flight";
import { Map, MapControls, useMap } from "@/components/ui/map";
import {
    buildTravelDashboard,
    TRAVEL_FLIGHT_LEGS,
} from "@/components/travel-data";
import { cn } from "@/lib/utils";

const ROUTE_COLOR = "#916651";
const ROUTE_ACTIVE_COLOR = "#8E644F";
const DESKTOP_PANEL_HEIGHT_CLASS = "lg:h-[min(38rem,72svh)]";

const GLOBE_CENTER: [number, number] = [120.96, 23.75];
const ROUTE_FOCUS_DURATION_MS = 3000;

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function zoomForContainerWidth(widthPx: number): number {
    if (widthPx < 380) {
        return 1.1;
    }
    if (widthPx < 480) {
        return 1.2;
    }
    if (widthPx < 640) {
        return 1.33;
    }
    if (widthPx < 900) {
        return 1.5;
    }
    return 1.63;
}

function wrapLongitude(longitude: number): number {
    return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

function midpointLongitude(a: number, b: number): number {
    const delta = ((b - a + 540) % 360) - 180;
    return wrapLongitude(a + delta / 2);
}

function haversineKm(a: [number, number], b: [number, number]): number {
    const toRad = (degree: number) => (degree * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const latDelta = toRad(b[1] - a[1]);
    const lngDelta = toRad(b[0] - a[0]);
    const sinLat = Math.sin(latDelta / 2);
    const sinLng = Math.sin(lngDelta / 2);
    const h =
        sinLat * sinLat +
        Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * sinLng * sinLng;

    return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function resolveRouteFocusViewport(route: FlightRouteData, widthPx: number) {
    const from = resolveAirport(route.from);
    const to = resolveAirport(route.to);
    const distanceKm = haversineKm(from, to);

    let zoom = 1.85;
    if (distanceKm < 1200) {
        zoom = 4.2;
    } else if (distanceKm < 2500) {
        zoom = 3.4;
    } else if (distanceKm < 4500) {
        zoom = 2.9;
    } else if (distanceKm < 7000) {
        zoom = 2.45;
    } else if (distanceKm < 10000) {
        zoom = 2.1;
    }

    if (widthPx < 640) {
        zoom -= 0.55;
    } else if (widthPx < 900) {
        zoom -= 0.25;
    }

    return {
        center: [
            midpointLongitude(from[0], to[0]),
            clamp((from[1] + to[1]) / 2, -70, 70),
        ] as [number, number],
        zoom: clamp(zoom, 1.45, 4.5),
    };
}

function describeAirport(ref: AirportRef) {
    if (typeof ref === "string") {
        const info = getAirportInfo(ref.toUpperCase());
        if (info) {
            return {
                code: info.code,
                city: info.city,
                country: info.country,
            };
        }

        return {
            code: ref.toUpperCase(),
            city: ref.toUpperCase(),
            country: "",
        };
    }

    return {
        code: "GPS",
        city: `${ref[1].toFixed(1)}°, ${ref[0].toFixed(1)}°`,
        country: "Custom point",
    };
}

function describeRouteRegion(
    from: ReturnType<typeof describeAirport>,
    to: ReturnType<typeof describeAirport>,
) {
    if (!from.country && !to.country) {
        return "";
    }
    if (from.country === to.country) {
        return from.country;
    }
    return [from.country, to.country].filter(Boolean).join(" · ");
}

function TravelGlobeViewportSync({
    selectedRoute,
}: {
    selectedRoute: FlightRouteData | null;
}) {
    const { map, isLoaded } = useMap();

    const applyViewport = useCallback(
        (animate: boolean) => {
            if (!map || !isLoaded) {
                return;
            }

            map.resize();
            const width = map.getContainer().clientWidth;

            if (selectedRoute) {
                const focusedViewport = resolveRouteFocusViewport(
                    selectedRoute,
                    width,
                );

                if (animate) {
                    map.flyTo({
                        ...focusedViewport,
                        pitch: 0,
                        bearing: 0,
                        duration: ROUTE_FOCUS_DURATION_MS,
                        curve: 1.55,
                        speed: 0.65,
                        easing: (t) => 1 - Math.pow(1 - t, 3),
                        essential: true,
                    });
                    return;
                }

                map.jumpTo({
                    ...focusedViewport,
                    pitch: 0,
                    bearing: 0,
                });
                return;
            }

            if (animate) {
                map.flyTo({
                    center: GLOBE_CENTER,
                    zoom: zoomForContainerWidth(width),
                    pitch: 0,
                    bearing: 0,
                    duration: ROUTE_FOCUS_DURATION_MS,
                    curve: 1.55,
                    speed: 0.65,
                    easing: (t) => 1 - Math.pow(1 - t, 3),
                    essential: true,
                });
                return;
            }

            map.jumpTo({
                center: GLOBE_CENTER,
                zoom: zoomForContainerWidth(width),
                pitch: 0,
                bearing: 0,
            });
        },
        [isLoaded, map, selectedRoute],
    );

    const applyViewportRef = useRef(applyViewport);
    applyViewportRef.current = applyViewport;

    useEffect(() => {
        applyViewport(true);
    }, [applyViewport, selectedRoute]);

    useEffect(() => {
        if (!map || !isLoaded) {
            return;
        }

        // Use ref so resize callbacks always call the latest applyViewport
        // without re-observing on every selectedRoute change, which would fire
        // an immediate spurious callback that overrides the flyTo animation.
        const apply = () => applyViewportRef.current(false);
        const el = map.getContainer();
        const ro = new ResizeObserver(apply);
        ro.observe(el);

        window.addEventListener("resize", apply);
        window.addEventListener("orientationchange", apply);

        return () => {
            ro.disconnect();
            window.removeEventListener("resize", apply);
            window.removeEventListener("orientationchange", apply);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, map]);

    return null;
}

const dashboard = buildTravelDashboard(TRAVEL_FLIGHT_LEGS);

const KM_TO_MI = 0.621371;

const STAT_CARDS = [
    {
        label: "Total Flights",
        value: dashboard.totalFlights.toLocaleString("en-US"),
    },
    {
        label: "Distance Flown",
        value: `${Math.round(dashboard.totalDistanceKm * KM_TO_MI).toLocaleString("en-US")} mi`,
    },
    {
        label: "Airports Visited",
        value: dashboard.airportsVisited.toLocaleString("en-US"),
    },
    {
        label: "Countries",
        value: dashboard.countriesVisited.toLocaleString("en-US"),
    },
] as const;

function StatCard({
    label,
    value,
    className,
}: {
    label: string;
    value: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "border-white-brown-600/70 bg-white-brown-100/90 flex flex-col gap-1 rounded-2xl border p-4 shadow-sm",
                className,
            )}
        >
            <span className="text-white-black-600 font-nunito text-xs tracking-wide">
                {label}
            </span>
            <span className="text-white-black-900 font-nunito text-2xl font-bold tracking-tight sm:text-3xl">
                {value}
            </span>
        </div>
    );
}

export default function Travel() {
    const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(
        null,
    );

    const selectedRoute =
        selectedRouteIndex == null
            ? null
            : (dashboard.mapRoutes[selectedRouteIndex] ?? null);

    const mapRoutes = useMemo(
        () =>
            dashboard.mapRoutes.map((route, index) => {
                const isActive = index === selectedRouteIndex;

                return {
                    ...route,
                    color: isActive ? ROUTE_ACTIVE_COLOR : ROUTE_COLOR,
                    width: isActive ? 3 : 2,
                    opacity: isActive ? 1 : 0.48,
                    animate: isActive
                        ? {
                              duration: 5200,
                              loop: true,
                              iconSize: 18,
                              iconClassName: "text-white",
                          }
                        : false,
                };
            }),
        [selectedRouteIndex],
    );

    return (
        <div className="text-white-black-900 bg-white-black-50 flex h-full min-h-0 w-full flex-col pt-6">
            <PageTitle title="My Travel" />
            <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-10 sm:px-8">
                <div className="mx-auto mt-4 grid w-full max-w-6xl gap-5 sm:mt-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-stretch">
                    <div
                        data-carousel-no-drag
                        className={cn(
                            "border-white-brown-600/60 relative mx-auto aspect-square w-full max-w-[min(48rem,85svh)] overflow-hidden rounded-2xl border shadow-md lg:aspect-auto lg:max-w-none",
                            DESKTOP_PANEL_HEIGHT_CLASS,
                        )}
                    >
                        <Map
                            className="h-full w-full [&_.maplibregl-ctrl-attrib]:text-[10px]!"
                            projection={{ type: "globe" }}
                            center={GLOBE_CENTER}
                            zoom={1.63}
                            pitch={0}
                            bearing={0}
                            minZoom={0.5}
                            maxZoom={6}
                            scrollZoom={true}
                            dragRotate={false}
                            touchPitch={false}
                        >
                            <TravelGlobeViewportSync
                                selectedRoute={selectedRoute}
                            />
                            <FlightRoutes
                                routes={mapRoutes}
                                color={ROUTE_COLOR}
                                width={2}
                                opacity={0.85}
                                showAirports
                                showLabel
                                labelClassName="!text-[9px] font-semibold"
                                hoverEffect
                                onClick={(routeIndex) =>
                                    setSelectedRouteIndex(routeIndex)
                                }
                            />
                            <MapControls
                                position="bottom-left"
                                showZoom
                                className="bottom-2 left-2"
                            />
                        </Map>
                    </div>

                    <div
                        data-carousel-no-drag
                        className={cn(
                            "border-white-brown-600/70 bg-white-brown-100/90 flex h-[26rem] min-h-0 flex-col overflow-hidden rounded-2xl border shadow-sm sm:h-[30rem]",
                            DESKTOP_PANEL_HEIGHT_CLASS,
                        )}
                    >
                        <div className="border-white-brown-600/70 border-b px-4 py-3">
                            <div>
                                <p className="text-white-brown-900 font-nunito text-sm font-bold tracking-wide">
                                    Flight Routes
                                </p>
                                <p className="text-white-brown-800 font-nunito text-xs">
                                    Click a route to focus the globe.
                                </p>
                            </div>
                        </div>

                        <div className="no-scrollbar flex flex-col gap-2 overflow-y-auto p-3">
                            {dashboard.mapRoutes.map((route, index) => {
                                const from = describeAirport(route.from);
                                const to = describeAirport(route.to);
                                const isActive = index === selectedRouteIndex;
                                const routeArrow =
                                    route.tripType === "round-trip" ? "↔" : "→";
                                const routeRegion = describeRouteRegion(
                                    from,
                                    to,
                                );

                                return (
                                    <button
                                        key={`${from.code}-${to.code}-${index}`}
                                        type="button"
                                        onClick={() =>
                                            setSelectedRouteIndex(index)
                                        }
                                        aria-pressed={isActive}
                                        className={cn(
                                            "border-white-brown-600/70 rounded-xl border px-4 py-3 text-left transition-all duration-200",
                                            isActive
                                                ? "bg-white-brown-500/90 border-white-brown-700 shadow-sm"
                                                : "bg-white-brown-300/80 hover:bg-white-brown-500/90",
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "font-nunito text-sm font-bold tracking-wide",
                                                isActive
                                                    ? "text-white-brown-900"
                                                    : "text-white-brown-900",
                                            )}
                                        >
                                            {from.city} {routeArrow} {to.city}
                                        </div>
                                        <p
                                            className={cn(
                                                "font-nunito mt-2 text-xs",
                                                isActive
                                                    ? "text-white-brown-800"
                                                    : "text-white-brown-800",
                                            )}
                                        >
                                            {from.code}
                                            {` ${routeArrow} `}
                                            {to.code}
                                            {routeRegion
                                                ? ` · ${routeRegion}`
                                                : ""}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    {STAT_CARDS.map((s) => (
                        <StatCard
                            key={s.label}
                            label={s.label}
                            value={s.value}
                        />
                    ))}
                </div>

                <p className="text-white-brown-800 font-nunito mx-auto max-w-3xl text-center text-xs tracking-wide sm:text-sm">
                    Built with{" "}
                    <Link
                        href="https://flightcn.yencheng.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white-brown-900 font-medium underline-offset-2 hover:underline"
                    >
                        flightcn
                    </Link>
                </p>
            </div>
        </div>
    );
}
