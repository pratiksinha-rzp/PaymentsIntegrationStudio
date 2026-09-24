import Sidebar from "@/components/Sidebar";

export default function SettingsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-[#f4f5f7] text-zinc-900">
            <div className="flex min-h-screen">
                <Sidebar activeItem="Settings" />

                <main className="min-w-0 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}