import Header from "@/components/header";
import Banner from "@/components/banner";
import Portfolio from "@/components/portfolio";
import Raycast from "@/components/raycast";
import Footer from "@/components/footer";

export default function Home() {
    return (
        <main className="h-screen w-full">
            <Header></Header>
            <Banner></Banner>
            <Portfolio></Portfolio>
            <Raycast></Raycast>
            <Footer></Footer>
        </main>
    );
}
