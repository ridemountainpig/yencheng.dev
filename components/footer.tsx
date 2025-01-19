export default function Footer() {
    return (
        <footer className="xs:text-lg flex h-screen items-center justify-center font-gensenb text-sm tracking-wider text-white-black-900">
            <h2>
                © {new Date().getFullYear()} Yen Cheng Lin. All rights reserved
            </h2>
        </footer>
    );
}
