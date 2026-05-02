const HOME_SECTION_QUERY_PARAM = "section";

const HOME_SECTION_ALIASES = {
    about: "portfolio",
    contact: "footer",
    intro: "home",
    project: "portfolio",
    projects: "portfolio",
    work: "portfolio",
    works: "portfolio",
} as const;

export const HOME_SECTIONS = [
    "home",
    "portfolio",
    "travel",
    "raycast",
    "footer",
] as const;

export type HomeSection = (typeof HOME_SECTIONS)[number];
type QueryValue = string | string[] | undefined;

function normalizeQueryValue(value: QueryValue) {
    if (Array.isArray(value)) {
        return value[0]?.trim().toLowerCase();
    }

    return value?.trim().toLowerCase();
}

export function getHomeSectionIndexFromQuery(value: QueryValue) {
    const normalizedValue = normalizeQueryValue(value);

    if (!normalizedValue) {
        return 0;
    }

    const aliasedValue =
        HOME_SECTION_ALIASES[
            normalizedValue as keyof typeof HOME_SECTION_ALIASES
        ] ?? normalizedValue;

    const sectionIndex = HOME_SECTIONS.indexOf(aliasedValue as HomeSection);

    if (sectionIndex !== -1) {
        return sectionIndex;
    }

    const parsedIndex = Number.parseInt(normalizedValue, 10);

    if (Number.isNaN(parsedIndex)) {
        return 0;
    }

    return Math.min(Math.max(parsedIndex, 0), HOME_SECTIONS.length - 1);
}

export function getHomeSectionFromIndex(index: number) {
    return HOME_SECTIONS[index] ?? HOME_SECTIONS[0];
}

export { HOME_SECTION_QUERY_PARAM };
