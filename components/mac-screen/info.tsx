import Title from "@/components/title";
import SecondTitle from "@/components/second-title";
import { InfoStyle } from "@/types/type";

interface InfoProps {
    title: string;
    description: string;
    tech: string;
    picture?: Array<{
        src: string;
        description: string;
    }>;
    style: InfoStyle;
}

export default function Info({
    title,
    description,
    tech,
    picture = [],
    style,
}: InfoProps) {
    return (
        <div
            className={`relative h-full w-full ${style.bg} font-gensenb text-white-black-900`}
        >
            <div className="flex justify-center py-4">
                <Title title={title} bgColor={style.secondBg} />
            </div>

            <div className={`text-md p-6 lg:text-lg ${style.bg}`}>
                <SecondTitle title="Introduction" bgColor={style.secondBg} />
                {description.split("\n").map((item, index) => (
                    <p key={index} className="py-2">
                        {item}
                    </p>
                ))}
            </div>

            <div className={`text-md px-6 pb-6 lg:text-lg ${style.bg}`}>
                <SecondTitle title="Tech" bgColor={style.secondBg} />
                <div
                    className={`mt-4 rounded-xl ${style.secondBg} bg-opacity-50`}
                >
                    <ul className="p-3">
                        {tech.split("\n").map((item, index) => (
                            <li key={index} className="py-1">
                                {item.trim()}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {picture && picture.length > 0 && (
                <div className={`text-md px-6 pb-6 lg:text-lg ${style.bg}`}>
                    <SecondTitle title="Screenshot" bgColor={style.secondBg} />
                    <div className="grid grid-cols-2 gap-2">
                        {picture.map((item, index) => (
                            <div key={index} className="col-span-1 p-2">
                                <img
                                    src={item.src}
                                    alt={item.description}
                                    className="rounded-xl"
                                />
                                <div className="text-md mt-1 flex w-full justify-center lg:text-lg">
                                    <span>{item.description}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
