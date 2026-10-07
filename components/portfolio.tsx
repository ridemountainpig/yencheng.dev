import Dock from "@/components/mac-screen/dock";
import PageTitle from "@/components/page-title";

export default function Portfolio() {
    return (
        <div className="text-white-black-900 flex h-full w-full flex-col pt-20 sm:pt-24">
            <PageTitle title="My Portfolio"></PageTitle>
            <div className="flex min-h-0 flex-1 justify-center px-1.5 py-4 sm:px-6">
                <div className="@container relative h-full w-[98%] rounded-3xl bg-cover bg-center bg-no-repeat sm:w-full sm:bg-[url('/mac-bg.webp')]">
                    {/* <Menubar></Menubar> */}
                    <Dock></Dock>
                </div>
            </div>
        </div>
    );
}
