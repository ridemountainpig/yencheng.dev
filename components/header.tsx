import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

export default function Header() {
    return (
        <header className="flex h-fit items-center justify-between px-2 py-6 sm:px-6">
            <h1 className="text-md rounded-xl bg-white-brown-500 p-2 px-3 font-gensenb text-white-brown-800 sm:text-2xl">
                Yen Cheng Lin
            </h1>
            <div className="flex h-fit items-center gap-x-2 text-white-black-900">
                <Link
                    href="https://github.com/ridemountainpig"
                    className="rounded-xl bg-white-brown-500 p-2 text-white-brown-800"
                >
                    <Github
                        size={30}
                        strokeWidth={2.25}
                        className="hidden sm:block"
                    />
                    <Github
                        size={25}
                        strokeWidth={2.25}
                        className="sm:hidden"
                    />
                </Link>
                <Link
                    href="https://www.linkedin.com/in/%E5%BD%A5%E6%88%90-%E6%9E%97-22948823a/"
                    className="rounded-xl bg-white-brown-500 p-2 text-white-brown-800"
                >
                    <Linkedin
                        size={30}
                        strokeWidth={2.25}
                        className="hidden sm:block"
                    />
                    <Linkedin
                        size={25}
                        strokeWidth={2.25}
                        className="sm:hidden"
                    />
                </Link>
                <Link
                    href="https://x.com/ridemountainpig"
                    className="rounded-xl bg-white-brown-500 p-2 text-white-brown-800"
                >
                    <Twitter
                        size={30}
                        strokeWidth={2.25}
                        className="hidden sm:block"
                    />
                    <Twitter
                        size={25}
                        strokeWidth={2.25}
                        className="sm:hidden"
                    />
                </Link>
            </div>
        </header>
    );
}
