import { Extension } from "@/types/type";
import { cn } from "@/lib/utils";

interface RaycastItemProps {
    extension: Extension;
    isSelected?: boolean;
}

export default function RaycastExtItem({
    extension,
    isSelected = false,
}: RaycastItemProps) {
    return (
        <div
            className={cn(
                "flex h-[40px] cursor-pointer items-center rounded-lg px-2.5",
                isSelected
                    ? "bg-white-brown-600/80"
                    : "bg-white-brown-500 hover:bg-white-brown-600/60",
            )}
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
        </div>
    );
}
