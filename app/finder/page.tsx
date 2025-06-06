import { MapPin, Briefcase, FileUser, HardDriveDownload } from "lucide-react";

export default function Finder() {
    const experience = [
        {
            title: "imCloud",
            titleLink: "https://imcloud.co/",
            jobTitle: "Frontend Engineer",
            date: "2025/02 - Present",
            description:
                "Develop the frontend of a Prognostics and Health Management (PHM) system for fault prediction and health monitoring using Next.js.",
        },
        {
            title: "Systex",
            titleLink: "https://tw.systex.com/en/",
            jobTitle: "Software Engineer Intern",
            date: "2023/07 - 2024/06",
            description:
                "Developed backend systems for government projects using Spring Boot, designing architectures and implementing accessibility standards for inclusive web solutions.",
        },
        {
            title: "Siemens",
            titleLink: "https://www.siemens.com/global/en.html",
            jobTitle: "Software Engineer Intern",
            date: "2023/04 - 2023/07",
            description:
                "Developed new feature modules using Node.js and wrote program tests with Jest.",
        },
    ];

    return (
        <div className="font-gensenb text-white-black-900 flex max-h-fit min-h-screen w-full items-center justify-center bg-white tracking-wider">
            <div className="w-[90%] max-w-xl bg-white pt-6 text-left sm:w-[80%] sm:pt-12">
                <div className="pb-6">
                    <h2 className="text-xl">Hi, i&apos;m Yen Cheng</h2>
                    <div className="mt-4 flex h-fit items-center">
                        <MapPin size={18} />
                        <span className="pl-2 text-xs sm:text-sm">
                            Taichung, Taiwan
                        </span>
                    </div>
                    <div className="mt-4 flex h-fit items-center">
                        <Briefcase size={18} />
                        <span className="pl-2 text-xs sm:text-sm">
                            Master&apos;s Student, Feng Chia University
                        </span>
                    </div>
                    <a
                        className="mt-4 flex h-fit items-center"
                        href="/finder/resume.pdf"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <FileUser size={18} />
                        <span className="pl-2 text-xs underline underline-offset-2 sm:text-sm">
                            My Resume
                        </span>
                    </a>
                    <div className="mt-4">
                        <span className="text-xs sm:text-sm">
                            A full-stack developer from Taiwan 🇹🇼, driven by a
                            passion for creating amazing things ✨. When not
                            contributing to open-source projects 🤝, you’ll find
                            me coding with a coffee in hand ☕️, always striving
                            to turn ideas into reality.
                        </span>
                    </div>
                </div>
                <div className="pb-6">
                    <h3 className="text-xl">Experience</h3>
                    {experience.map((item, index) => (
                        <div key={index} className="py-2">
                            <div className="flex h-fit items-center gap-x-2">
                                {item.titleLink ? (
                                    <a
                                        href={item.titleLink}
                                        className="text-md underline underline-offset-2"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {item.title}
                                    </a>
                                ) : (
                                    <span className="text-md underline underline-offset-2">
                                        {item.title}
                                    </span>
                                )}
                            </div>
                            <div className="flex h-fit items-center gap-x-2 py-2 text-xs sm:text-sm">
                                <span>{item.jobTitle}</span>
                                <span>{item.date}</span>
                            </div>
                            <div className="py-1 text-xs sm:text-sm">
                                {item.description}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="pb-6">
                    <h3 className="text-xl">Project</h3>
                    <div className="flex h-fit items-center gap-x-3 py-2">
                        <HardDriveDownload
                            size={20}
                            className="hidden sm:block"
                        />
                        {/* <HardDriveDownload size={16} className="sm:hidden" /> */}
                        <span className="text-xs sm:text-sm">
                            Click the under dock item to view my projects.
                        </span>
                        <HardDriveDownload
                            size={20}
                            className="hidden sm:block"
                        />
                        {/* <HardDriveDownload size={16} className="sm:hidden" /> */}
                    </div>
                </div>
                <div className="pb-6">
                    <h3 className="text-xl">Link</h3>
                    <div className="flex h-fit items-center gap-x-3 py-2 text-xs sm:text-sm">
                        <a
                            href="https://github.com/ridemountainpig"
                            className="underline underline-offset-2"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Github
                        </a>
                        <a
                            href="https://www.linkedin.com/in/%E5%BD%A5%E6%88%90-%E6%9E%97-22948823a/"
                            className="underline underline-offset-2"
                            target="_blank"
                            rel="noreferrer"
                        >
                            LinkedIn
                        </a>
                        <a
                            href="https://twitter.com/ridemountainpig"
                            className="underline underline-offset-2"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Twitter
                        </a>
                        <a
                            href="mailto:lin0905580802@gmail.com"
                            className="underline underline-offset-2"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Mail
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
