import { Extension } from "@/types/type";

interface RaycastItemProps {
    extension: Extension;
    index: number;
}

export default function RaycastExtItem({ extension, index }: RaycastItemProps) {
    return (
        <a
            key={index}
            className="bg-white-brown-500 hover:bg-white-brown-600/60 flex h-[40px] items-center rounded-lg px-2.5"
            href={extension.store_url}
            target="_blank"
        >
            <img
                src={extension.icons.light ?? ""}
                height={20}
                width={20}
                alt={extension.title}
            />
            <span className="ml-3 text-sm">{extension.title}</span>
            <span className="text-white-black-700 ml-3 hidden text-sm md:block">
                {extension.description.length > 45
                    ? extension.description.slice(0, 45) + "..."
                    : extension.description}
            </span>
        </a>
    );
}
