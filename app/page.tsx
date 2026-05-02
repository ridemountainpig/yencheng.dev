import { Suspense } from "react";

import Banner from "@/components/banner";
import Footer from "@/components/footer";
import Header from "@/components/header";
import HomeCarousel from "@/components/home-carousel";
import Portfolio from "@/components/portfolio";
import Raycast from "@/components/raycast";
import Travel from "@/components/travel";
import { CarouselItem } from "@/components/ui/carousel";

export default function Home() {
    return (
        <main className="h-screen w-full overflow-hidden">
            <Suspense fallback={null}>
                <HomeCarousel>
                    <CarouselItem>
                        <Header></Header>
                        <Banner></Banner>
                    </CarouselItem>
                    <CarouselItem>
                        <Portfolio></Portfolio>
                    </CarouselItem>
                    <CarouselItem className="flex h-screen max-h-screen flex-col overflow-hidden">
                        <Travel></Travel>
                    </CarouselItem>
                    <CarouselItem>
                        <Raycast></Raycast>
                    </CarouselItem>
                    <CarouselItem>
                        <Footer></Footer>
                    </CarouselItem>
                </HomeCarousel>
            </Suspense>
        </main>
    );
}
