import type { AirportRef, FlightRouteData } from "@/components/ui/flight";
import { getAirportInfo, resolveAirport } from "@/components/ui/flight";

import travelFlightsJson from "@/app/travel/flight.json";

export type TravelEndpoint = AirportRef;

export type TravelTripType = "round-trip" | "one-way";

export type TravelFlightLeg = {
    from: TravelEndpoint;
    to: TravelEndpoint;
    tripType?: TravelTripType;
};

function endpointVisitKey(ref: TravelEndpoint): string {
    if (typeof ref === "string") {
        return `code:${ref.toUpperCase()}`;
    }
    const [lng, lat] = ref;
    return `coord:${lng.toFixed(6)},${lat.toFixed(6)}`;
}

function routePairKey(from: TravelEndpoint, to: TravelEndpoint): string {
    return `${endpointVisitKey(from)}→${endpointVisitKey(to)}`;
}

function tripLegWeight(leg: TravelFlightLeg): number {
    return leg.tripType === "round-trip" ? 2 : 1;
}

function haversineKm(a: [number, number], b: [number, number]): number {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b[1] - a[1]);
    const dLng = toRad(b[0] - a[0]);
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const h =
        sinLat * sinLat +
        Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * sinLng * sinLng;
    return 2 * R * Math.asin(Math.sqrt(h));
}

function legGreatCircleKm(leg: TravelFlightLeg): number | null {
    try {
        const from = resolveAirport(leg.from);
        const to = resolveAirport(leg.to);
        return haversineKm(from, to);
    } catch {
        return null;
    }
}

export const TRAVEL_FLIGHT_LEGS: TravelFlightLeg[] =
    travelFlightsJson as TravelFlightLeg[];

export type TravelDashboard = {
    totalFlights: number;
    airportsVisited: number;
    countriesVisited: number;
    /** Sum of great-circle km per leg × trip weight (round-trip = 2). */
    totalDistanceKm: number;
    mapRoutes: FlightRouteData[];
};

export function buildTravelDashboard(legs: TravelFlightLeg[]): TravelDashboard {
    const totalFlights = legs.reduce((sum, leg) => sum + tripLegWeight(leg), 0);

    let totalDistanceKm = 0;
    for (const leg of legs) {
        const km = legGreatCircleKm(leg);
        if (km != null) {
            totalDistanceKm += km * tripLegWeight(leg);
        }
    }

    const visitKeys = new Set<string>();
    const countrySet = new Set<string>();
    for (const leg of legs) {
        for (const end of [leg.from, leg.to]) {
            visitKeys.add(endpointVisitKey(end));
            if (typeof end === "string") {
                const info = getAirportInfo(end.toUpperCase());
                if (info?.country) {
                    countrySet.add(info.country);
                }
            }
        }
    }

    const routeKeys = new Set<string>();
    const mapRoutes: FlightRouteData[] = [];
    for (const leg of legs) {
        const tripType: TravelTripType = leg.tripType ?? "one-way";
        const key = `${routePairKey(leg.from, leg.to)}|${tripType}`;
        if (routeKeys.has(key)) {
            continue;
        }
        routeKeys.add(key);
        const from =
            typeof leg.from === "string" ? leg.from.toUpperCase() : leg.from;
        const to = typeof leg.to === "string" ? leg.to.toUpperCase() : leg.to;
        mapRoutes.push({ from, to, tripType });
    }

    return {
        totalFlights,
        airportsVisited: visitKeys.size,
        countriesVisited: countrySet.size,
        totalDistanceKm,
        mapRoutes,
    };
}
