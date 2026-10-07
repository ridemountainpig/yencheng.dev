"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

import FlightBoard from "@/components/flight-board";
import PageTitle from "@/components/page-title";
import {
    buildFlightLog,
    buildTravelDashboard,
    KM_TO_MI,
    TRAVEL_FLIGHT_LEGS,
} from "@/components/travel-data";
import { cn } from "@/lib/utils";

const ROUTE_COLOR = "#916651";
const ROUTE_ACTIVE_COLOR = "#8E644F";
const DESKTOP_PANEL_HEIGHT_CLASS = "lg:h-[min(38rem,72svh)]";

// MapLibre is about 1 MB, so the globe is fetched only once the travel section
// is within half a screen of view (reached from the portfolio section) rather
// than with the home page.
const TravelGlobe = dynamic(() => import("@/components/travel-globe"), {
    ssr: false,
});

function useNearViewport<T extends Element>() {
    const ref = useRef<T>(null);
    const [near, setNear] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element || near) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) setNear(true);
            },
            { rootMargin: "50% 0px" },
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, [near]);

    return [ref, near] as const;
}

const dashboard = buildTravelDashboard(TRAVEL_FLIGHT_LEGS);
const flightLog = buildFlightLog(TRAVEL_FLIGHT_LEGS);

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
    const [globeRef, nearViewport] = useNearViewport<HTMLDivElement>();
    const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(
        null,
    );

    const selectedRoute =
        selectedRouteIndex == null
            ? null
            : (dashboard.mapRoutes[selectedRouteIndex] ?? null);

    const selectRoute = useCallback((routeKey: string) => {
        const index = dashboard.mapRoutes.findIndex(
            (route) => route.routeKey === routeKey,
        );
        if (index >= 0) {
            setSelectedRouteIndex(index);
        }
    }, []);

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
        <div className="text-white-black-900 flex w-full flex-col pt-20 sm:pt-24">
            <PageTitle title="My Travel" />
            <div className="flex flex-col gap-6 px-4 pb-10 sm:px-8">
                <div className="mx-auto mt-4 grid w-full max-w-6xl gap-5 sm:mt-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-stretch">
                    <div
                        ref={globeRef}
                        className={cn(
                            "border-white-brown-600/60 relative mx-auto aspect-square w-full max-w-[min(48rem,85svh)] overflow-hidden rounded-2xl border shadow-md lg:aspect-auto lg:max-w-none",
                            DESKTOP_PANEL_HEIGHT_CLASS,
                        )}
                    >
                        {nearViewport && (
                            <TravelGlobe
                                routes={mapRoutes}
                                selectedRoute={selectedRoute}
                                color={ROUTE_COLOR}
                                onSelectRoute={setSelectedRouteIndex}
                            />
                        )}
                    </div>

                    <FlightBoard
                        rows={flightLog}
                        selectedRouteKey={selectedRoute?.routeKey ?? null}
                        onSelectRoute={selectRoute}
                        className={cn(
                            "h-[26rem] sm:h-[30rem]",
                            DESKTOP_PANEL_HEIGHT_CLASS,
                        )}
                    />
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
