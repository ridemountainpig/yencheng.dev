import type { ComponentType } from "react";
import { Newspaper } from "lucide-react";
import { GitHubLight, LinkedIn, Twitter } from "@ridemountainpig/svgl-react";

export const BLOG_URL = "https://blog.yencheng.dev";

type SocialLink = {
    label: string;
    href: string;
    Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
    /** svgl logos are filled shapes and need a fill color; lucide icons are strokes. */
    filled: boolean;
};

export const SOCIAL_LINKS: SocialLink[] = [
    {
        label: "GitHub",
        href: "https://github.com/ridemountainpig",
        Icon: GitHubLight,
        filled: true,
    },
    {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/iamyencheng/",
        Icon: LinkedIn,
        filled: true,
    },
    {
        label: "X",
        href: "https://x.com/ridemountainpig",
        Icon: Twitter,
        filled: true,
    },
    {
        label: "Blog",
        href: BLOG_URL,
        Icon: Newspaper,
        filled: false,
    },
];
