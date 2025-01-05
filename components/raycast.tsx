import Image from "next/image";
import {
    getRaycastExtensions,
    getRaycastContributionExtensions,
} from "@/utils/raycast";
import Title from "@/components/title";
import RaycastExtensions from "@/components/raycast/raycast-extensions";

export default async function Raycast() {
    const extensions = await getRaycastExtensions();
    const contributionExtensions = await getRaycastContributionExtensions();

    return (
        <div className="w-full bg-white-black-50 pt-6 text-white-black-900">
            <div className="flex justify-center">
                <Title title="My Raycast Extensions"></Title>
            </div>
            <div className="flex h-[90vh] w-full items-center justify-center">
                <div className="h-[472px] w-[750px] select-none rounded-2xl border-[1px] border-white-brown-600 bg-white-brown-500 font-gensenb text-white-black-900 shadow-lg shadow-white-black-200">
                    <div className="h-[55px] border-b-[1px] border-white-brown-600 border-opacity-70 p-[18px]">
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
                    <div className="flex h-[39px] items-center justify-start border-t-[1px] border-white-brown-600">
                        <Image
                            src="/raycast.svg"
                            width={20}
                            height={20}
                            alt="raycast icon"
                            className="ml-3"
                        ></Image>
                    </div>
                </div>
            </div>
        </div>
    );
}
