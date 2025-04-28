import { ImageResponse } from "@vercel/og";

export const config = {
    runtime: "edge",
};

export default async function og() {
    const fontData = await fetch(
        new URL("../../asset/gensenb.ttf", import.meta.url),
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "white",
                }}
            >
                <div tw="w-full flex flex-col items-center text-center font-gensenb tracking-widest text-[#1a1a1a] text-8xl">
                    <div>Hello</div>
                    <div tw="flex h-fit items-center justify-center pt-12">
                        <div tw="pr-6">I&apos;m</div>
                        <div tw="relative flex">
                            <div tw="absolute -bottom-7 left-0 h-16 w-full bg-[#f2e9e3] opacity-90" />
                            <div tw="relative flex items-center px-4">
                                Yen Cheng Lin
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: "gensenb",
                    data: fontData,
                    style: "normal",
                },
            ],
        },
    );
}
