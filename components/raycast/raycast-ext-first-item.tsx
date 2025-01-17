import Image from "next/image";
import { Extension } from "@/types/type";

interface RaycastItemProps {
    extension: Extension;
    index: number;
}

export default function RaycastExtFirstItem({
    extension,
    index,
}: RaycastItemProps) {
    return (
        <a
            key={index}
            className="flex h-[40px] items-center rounded-lg bg-white-brown-600 bg-opacity-80 px-2.5"
            href={extension.store_url}
            target="_blank"
        >
            <Image
                src={extension.icons.light ?? ""}
                height={20}
                width={20}
                alt={extension.title}
            />
            <span className="ml-3 text-sm">{extension.title}</span>
            <span className="ml-3 hidden text-sm text-white-black-700 md:block">
                {extension.description.length > 45
                    ? extension.description.slice(0, 45) + "..."
                    : extension.description}
            </span>
        </a>
    );
}
