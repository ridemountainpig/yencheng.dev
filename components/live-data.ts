import liveShowsJson from "@/app/live/live-shows.json";

type LiveVenueData = {
    name: string;
    city: string;
    coordinates: [latitude: number, longitude: number];
};

export type LiveVenue = LiveVenueData & {
    id: string;
};

export type LiveShow = {
    date: string;
    artist: string;
    title: string;
    venue: string;
    note?: string;
    image?: string;
};

export type LiveShowEvent = {
    key: string;
    show: LiveShow;
    venue: LiveVenue;
};

export type LiveDashboard = {
    events: LiveShowEvent[];
    venues: LiveVenue[];
    showCountByVenue: Map<string, number>;
    totalShows: number;
    artistsSeen: number;
    venuesVisited: number;
    citiesVisited: number;
};

type LiveShowsData = {
    venues: LiveVenueData[];
    shows: LiveShow[];
};

export function buildLiveDashboard(data: LiveShowsData): LiveDashboard {
    const allVenues = data.venues.map((venue) => ({
        ...venue,
        id: venue.name,
    }));
    const venueByName = new Map(allVenues.map((venue) => [venue.name, venue]));
    const showCountByVenue = new Map<string, number>();

    const events = data.shows
        .flatMap((show) => {
            const venue = venueByName.get(show.venue);
            if (!venue) {
                return [];
            }

            showCountByVenue.set(
                venue.id,
                (showCountByVenue.get(venue.id) ?? 0) + 1,
            );

            return [
                {
                    key: [show.date, show.artist, show.title, show.venue].join(
                        ":",
                    ),
                    show,
                    venue,
                },
            ];
        })
        .sort((a, b) => b.show.date.localeCompare(a.show.date));

    const venues = allVenues.filter((venue) => showCountByVenue.has(venue.id));

    return {
        events,
        venues,
        showCountByVenue,
        totalShows: events.length,
        artistsSeen: new Set(events.map(({ show }) => show.artist)).size,
        venuesVisited: venues.length,
        citiesVisited: new Set(venues.map((venue) => venue.city)).size,
    };
}

export const LIVE_DASHBOARD = buildLiveDashboard(
    liveShowsJson as LiveShowsData,
);
