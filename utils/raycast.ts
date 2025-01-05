async function getRaycastExtensions() {
    try {
        const response = await fetch(
            "https://www.raycast.com/frontend_api/extensions/ridemountainpig",
            { next: { revalidate: 86400 } },
        );

        if (!response.ok) {
            throw new Error("Failed to fetch extensions data from Raycast");
        }

        try {
            const extensionJson = await response.json();
            return extensionJson["data"];
        } catch {
            throw new Error("Failed to parse JSON");
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function getRaycastContributionExtensions() {
    try {
        const response = await fetch(
            "https://www.raycast.com/frontend_api/extensions/ridemountainpig/contributions",
            { next: { revalidate: 86400 } },
        );

        if (!response.ok) {
            throw new Error("Failed to fetch extensions data from Raycast");
        }

        try {
            const extensionJson = await response.json();
            return extensionJson["data"];
        } catch {
            throw new Error("Failed to parse JSON");
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

export { getRaycastExtensions, getRaycastContributionExtensions };
