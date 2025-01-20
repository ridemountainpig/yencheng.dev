import * as React from "react";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";

import Header from "@/components/header";
import Banner from "@/components/banner";
import Portfolio from "@/components/portfolio";
import Raycast from "@/components/raycast";
import Footer from "@/components/footer";

export default function Home() {
    return (
        <main className="h-screen w-full overflow-hidden">
            <Carousel>
                <CarouselContent>
                    <CarouselItem>
                        <Header></Header>
                        <Banner></Banner>
                    </CarouselItem>
                    <CarouselItem>
                        <Portfolio></Portfolio>
                    </CarouselItem>
                    <CarouselItem>
                        <Raycast></Raycast>
                    </CarouselItem>
                    <CarouselItem>
                        <Footer></Footer>
                    </CarouselItem>
                </CarouselContent>
            </Carousel>
        </main>
    );
}
