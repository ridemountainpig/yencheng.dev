"use client";

import { useCallback, useEffect, useRef, type ComponentProps } from "react";

import { FlightRoutes, type FlightRouteData } from "@/components/ui/flight";
import { resolveAirport } from "@/components/ui/flight-airports-utils";
import { Map, MapControls, useMap } from "@/components/ui/map";

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

interface TravelGlobeProps {
    routes: ComponentProps<typeof FlightRoutes>["routes"];
    selectedRoute: FlightRouteData | null;
    color: string;
    onSelectRoute: (routeIndex: number) => void;
}

/**
 * The travel globe. Kept in its own module so MapLibre (about 1 MB) is split
 * out of the home page bundle and only loads when the travel section nears
 * the screen.
 */
export default function TravelGlobe({
    routes,
    selectedRoute,
    color,
    onSelectRoute,
}: TravelGlobeProps) {
    return (
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
            // Page scroll passes over the globe; zooming takes
            // ⌘/Ctrl + scroll, panning on touch takes two fingers.
            cooperativeGestures={true}
            dragRotate={false}
            touchPitch={false}
        >
            <TravelGlobeViewportSync selectedRoute={selectedRoute} />
            <FlightRoutes
                routes={routes}
                color={color}
                width={2}
                opacity={0.85}
                showAirports
                showLabel
                labelClassName="!text-[9px] font-semibold"
                hoverEffect
                onClick={onSelectRoute}
            />
            <MapControls
                position="bottom-left"
                showZoom
                className="bottom-2 left-2"
            />
        </Map>
    );
}
