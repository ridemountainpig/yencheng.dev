"use client";

import RaycastExtFirstItem from "@/components/raycast/raycast-ext-first-item";
import RaycastExtItem from "@/components/raycast/raycast-ext-item";
import { Extension } from "@/types/type";

interface RaycastExtensionsProps {
    extensions: Extension[];
    contributionExtensions: Extension[];
}

export default function RaycastExtensions({
    extensions,
    contributionExtensions,
}: RaycastExtensionsProps) {
    return (
        <div className="no-scrollbar h-[378px] overflow-y-auto">
            <div className="px-[18px] pt-2">
                <span className="text-xs font-semibold">My Extensions</span>
            </div>
            <div className="px-[8px] pt-2">
                {extensions?.map((extension, index) => {
                    if (index === 0) {
                        return (
                            <RaycastExtFirstItem
                                key={"MyExtensions" + index}
                                extension={extension}
                                index={index}
                            />
                        );
                    } else {
                        return (
                            <RaycastExtItem
                                key={"MyExtensions" + index}
                                extension={extension}
                                index={index}
                            />
                        );
                    }
                })}
            </div>
            <div className="px-[18px] pt-2">
                <span className="text-xs font-semibold">
                    My Contributions Extensions
                </span>
            </div>
            <div className="px-[8px] pt-2">
                {contributionExtensions?.map((extension, index) => (
                    <RaycastExtItem
                        key={"MyContributionsExtensions" + index}
                        extension={extension}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
}
