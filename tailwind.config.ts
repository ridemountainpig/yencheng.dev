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
                main: {
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
            },
        },
    },
    plugins: [],
} satisfies Config;
