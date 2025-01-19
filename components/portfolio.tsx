import Dock from "@/components/mac-screen/dock";
import PageTitle from "@/components/page-title";

export default function Portfolio() {
    return (
        <div className="w-full bg-white-black-50 pt-6 text-white-black-900">
            <PageTitle title="My Portfolio"></PageTitle>
            <div className="flex justify-center px-1.5 py-4 sm:px-6">
                <div className="relative h-[90vh] w-[98%] rounded-3xl bg-cover bg-center bg-no-repeat sm:w-full sm:bg-[url('/mac-bg.png')]">
                    {/* <Menubar></Menubar> */}
                    <Dock></Dock>
                </div>
            </div>
        </div>
    );
}
