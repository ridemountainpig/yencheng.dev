import Link from "next/link";
import { Github, Linkedin, Twitter, Newspaper } from "lucide-react";

export default function Header() {
    return (
        <header className="flex h-fit items-center justify-between px-2 py-6 sm:px-6">
            <h1 className="text-md bg-white-brown-500 font-nunito text-white-brown-800 rounded-xl p-2 px-3 sm:text-2xl">
                Yen Cheng Lin
            </h1>
            <div className="text-white-black-900 flex h-fit items-center gap-x-2">
                <Link
                    href="https://github.com/ridemountainpig"
                    title="GitHub"
                    className="bg-white-brown-500 text-white-brown-800 rounded-xl p-2"
                >
                    <Github
                        strokeWidth={2.25}
                        className="size-[25px] sm:size-[30px]"
                    />
                </Link>
                <Link
                    href="https://www.linkedin.com/in/iamyencheng/"
                    title="LinkedIn"
                    className="bg-white-brown-500 text-white-brown-800 rounded-xl p-2"
                >
                    <Linkedin
                        strokeWidth={2.25}
                        className="size-[25px] sm:size-[30px]"
                    />
                </Link>
                <Link
                    href="https://x.com/ridemountainpig"
                    title="X"
                    className="bg-white-brown-500 text-white-brown-800 rounded-xl p-2"
                >
                    <Twitter
                        strokeWidth={2.25}
                        className="size-[25px] sm:size-[30px]"
                    />
                </Link>
                <Link
                    href="https://blog.yencheng.dev"
                    title="Blog"
                    className="bg-white-brown-500 text-white-brown-800 rounded-xl p-2"
                >
                    <Newspaper
                        strokeWidth={2.25}
                        className="size-[25px] sm:size-[30px]"
                    />
                </Link>
            </div>
        </header>
    );
}
