import Title from "@/components/title";
import Dock from "@/components/mac-screen/dock";

export default function Portfolio() {
    return (
        <div className="w-full bg-white-black-50 text-white-black-900">
            <div className="flex justify-center">
                <Title title="My Portfolio"></Title>
            </div>
            <div className="p-6">
                <div
                    className="relative h-[90vh] w-full rounded-3xl bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: "url(/mac-bg.png)",
                    }}
                >
                    {/* <Menubar></Menubar> */}
                    <Dock></Dock>
                </div>
            </div>
        </div>
    );
}