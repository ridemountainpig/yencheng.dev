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
                "flex h-[38px] cursor-pointer items-center rounded-[10px] px-2",
                isSelected
                    ? "bg-white-brown-600/80"
                    : "bg-white-brown-500 hover:bg-white-brown-600/60",
            )}
        >
            <img
                src={extension.icons.light ?? ""}
                height={22}
                width={22}
                alt={extension.title}
                className="shrink-0 rounded-md"
            />
            <span className="ml-2.5 truncate text-[15px] font-medium">
                {extension.title}
            </span>
            <span className="text-white-black-700 ml-3.5 hidden truncate text-[15px] md:block">
                {extension.description.length > 45
                    ? extension.description.slice(0, 45) + "..."
                    : extension.description}
            </span>
            <span className="text-white-black-700 ml-auto shrink-0 pl-3 text-sm">
                Extension
            </span>
        </div>
    );
}
