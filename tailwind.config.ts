import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "white-black": {
                    "50": "#fafafa",
                    "100": "#e4e4e4",
                    "200": "#cdcdcd",
                    "300": "#b7b7b7",
                    "400": "#a0a0a0",
                    "500": "#8a8a8a",
                    "600": "#747474",
                    "700": "#5d5d5d",
                    "800": "#474747",
                    "900": "#1a1a1a",
                },
                "white-brown": {
                    "50": "#FFFFFF",
                    "100": "#FFFEFC",
                    "200": "#FCFCFA",
                    "300": "#FAF8F5",
                    "400": "#F7F2ED",
                    "500": "#F2E9E3",
                    "600": "#DBC7BA",
                    "700": "#B5927F",
                    "800": "#916651",
                    "900": "#6E402E",
                    "950": "#472013",
                },
                "dock-tooltip": "#F9FBFD",
                menubar: "#ECECF0",
            },
            fontFamily: {
                gensenb: ["var(--font-gensenb)", "sans-serif"],
            },
        },
    },
    plugins: [],
} satisfies Config;
