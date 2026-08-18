import PageTitle from "@/components/page-title";
import RaycastExtensions from "@/components/raycast/raycast-extensions";
import TabKeyHandler from "@/components/raycast/tab-key-handler";
import {
    getRaycastContributionExtensions,
    getRaycastExtensions,
} from "@/utils/raycast";

export default async function Raycast() {
    const [extensions, contributionExtensions] = await Promise.all([
        getRaycastExtensions(),
        getRaycastContributionExtensions(),
    ]);

    return (
        <div className="bg-white-black-50 text-white-black-900 h-full w-full pt-6">
            <TabKeyHandler />
            <PageTitle title="My Raycast Extensions"></PageTitle>
            <div className="-mt-6 flex h-full w-full items-center justify-center px-1">
                <RaycastExtensions
                    extensions={extensions}
                    contributionExtensions={contributionExtensions}
                ></RaycastExtensions>
            </div>
        </div>
    );
}
