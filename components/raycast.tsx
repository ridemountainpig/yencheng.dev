import {
    getRaycastExtensions,
    getRaycastContributionExtensions,
} from "@/utils/raycast";
import PageTitle from "@/components/page-title";
import RaycastExtensions from "@/components/raycast/raycast-extensions";

export default async function Raycast() {
    const extensions = await getRaycastExtensions();
    const contributionExtensions = await getRaycastContributionExtensions();

    return (
        <div className="bg-white-black-50 text-white-black-900 h-full w-full pt-6">
            <PageTitle title="My Raycast Extensions"></PageTitle>
            <div className="-mt-6 flex h-full w-full items-center justify-center px-1">
                <div className="border-white-brown-600 bg-white-brown-500 font-gensenb text-white-black-900 shadow-white-black-200 h-[472px] w-[96%] rounded-2xl border-[1px] shadow-lg select-none md:w-[750px]">
                    <div className="border-white-brown-600/70 h-[55px] border-b-[1px] p-[18px]">
                        <span className="tracking-wider">
                            Yen Cheng Raycast Extensions...
                        </span>
                    </div>
                    <div className="no-scrollbar h-[378px] overflow-y-auto">
                        <RaycastExtensions
                            extensions={extensions}
                            contributionExtensions={contributionExtensions}
                        ></RaycastExtensions>
                    </div>
                    <div className="border-white-brown-600 flex h-[39px] items-center justify-start border-t-[1px]">
                        <img
                            src="/raycast.svg"
                            width={20}
                            height={20}
                            alt="raycast icon"
                            className="ml-3"
                        ></img>
                    </div>
                </div>
            </div>
        </div>
    );
}
