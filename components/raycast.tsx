import {
    getRaycastExtensions,
    getRaycastContributionExtensions,
} from "@/utils/raycast";
import { SquareArrowOutUpRight } from "lucide-react";
import PageTitle from "@/components/page-title";
import RaycastExtensions from "@/components/raycast/raycast-extensions";
import TabKeyHandler from "@/components/raycast/tab-key-handler";

export default async function Raycast() {
    const extensions = await getRaycastExtensions();
    const contributionExtensions = await getRaycastContributionExtensions();

    return (
        <div className="bg-white-black-50 text-white-black-900 h-full w-full pt-6">
            <TabKeyHandler />
            <PageTitle title="My Raycast Extensions"></PageTitle>
            <div className="-mt-6 flex h-full w-full items-center justify-center px-1">
                <div className="border-white-brown-600 bg-white-brown-500 font-nunito text-white-black-900 shadow-white-black-200 h-[472px] w-[96%] rounded-2xl border shadow-lg select-none md:w-[750px]">
                    <div className="border-white-brown-600/70 flex h-[55px] items-center justify-between border-b p-[18px]">
                        <span className="tracking-wider">
                            Yen Cheng Raycast Extensions...
                        </span>
                        <a
                            href="https://raycast.com/ridemountainpig"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-x-2 text-sm tracking-wider"
                        >
                            <span className="hidden sm:block">
                                To Raycast Page
                            </span>
                            <span className="border-white-brown-600 hidden rounded-lg border px-1 py-0.5 sm:block">
                                Tab
                            </span>
                            <SquareArrowOutUpRight
                                size={16}
                                strokeWidth={2.5}
                                className="sm:hidden"
                            />
                        </a>
                    </div>
                    <div className="no-scrollbar h-[378px] overflow-y-auto">
                        <RaycastExtensions
                            extensions={extensions}
                            contributionExtensions={contributionExtensions}
                        ></RaycastExtensions>
                    </div>
                    <div className="border-white-brown-600 flex h-[39px] items-center justify-start border-t">
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
