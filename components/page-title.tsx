import Title from "@/components/title";

interface PageTitleProps {
    title: string;
}

export default function PageTitle({ title }: PageTitleProps) {
    return (
        <div className="flex h-fit items-center justify-center px-4 sm:px-8">
            <Title title={title} as="h2"></Title>
        </div>
    );
}
