type NavItem = {
    label: string;
    href: string;
    icon: React.ReactNode;
};

const navItems: NavItem[] = [
    {
        label: "Dashboard",
        href: "/",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
            >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
    },
    {
        label: "Scenarios",
        href: "/scenarios",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
            >
                <circle cx="12" cy="12" r="8.5" />
                <path d="M8.5 9.5h7M8.5 12h7M8.5 14.5h4" />
            </svg>
        ),
    },
    {
        label: "API Replay",
        href: "/api-replay",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
            >
                <path d="M5 12h12" />
                <path d="m13 6 6 6-6 6" />
            </svg>
        ),
    },
    {
        label: "Webhooks",
        href: "/webhooks",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
            >
                <path d="M18 8a5 5 0 0 0-9.3-2.5" />
                <path d="M6 16a5 5 0 0 0 9.3 2.5" />
                <path d="M8 8H4v4" />
                <path d="M16 16h4v-4" />
            </svg>
        ),
    },
    {
        label: "Templates",
        href: "#",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
            >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M7 8h10M7 12h10M7 16h6" />
            </svg>
        ),
    },
    {
        label: "History",
        href: "/executions",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
            >
                <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
                <path d="M3.5 5.5v5h5" />
                <path d="M12 7v5l3 2" />
            </svg>
        ),
    },
];

type SidebarProps = {
    activeItem: string;
};

export default function Sidebar({
    activeItem,
}: SidebarProps) {
    return (
        <aside className="hidden w-[280px] shrink-0 bg-[#172d6b] text-white lg:flex lg:flex-col">
            {/* Brand */}
            <div className="flex h-[86px] items-center px-7">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white shadow-sm">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-5 w-5"
                        >
                            <path d="M12 3.5 18.5 7v10L12 20.5 5.5 17V7L12 3.5Z" />
                            <circle cx="12" cy="12" r="2.5" />
                        </svg>
                    </div>

                    <div>
                        <p className="text-sm font-semibold tracking-wide text-white">
                            Razorpay
                        </p>

                        <p className="mt-0.5 text-[11px] text-blue-200">
                            Integration Studio
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-5 py-6">
                <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-200/70">
                    Workspace
                </p>

                <nav className="space-y-1.5">
                    {navItems.map((item) => {
                        const active =
                            activeItem === item.label;

                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                                    active
                                        ? "bg-[#294489] font-semibold text-white shadow-sm"
                                        : "text-blue-100/70 hover:bg-[#223c7e] hover:text-white"
                                }`}
                            >
                                <span className="h-5 w-5">
                                    {item.icon}
                                </span>

                                {item.label}
                            </a>
                        );
                    })}
                </nav>

                {/* Configuration */}
                <div className="mt-8">
                    <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-200/70">
                        Configuration
                    </p>

                    <a
                        href="/settings"
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                            activeItem === "Settings"
                                ? "bg-[#294489] font-semibold text-white shadow-sm"
                                : "text-blue-100/70 hover:bg-[#223c7e] hover:text-white"
                        }`}
                    >
                        <span className="h-5 w-5">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-5 w-5"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="3"
                                />
                                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.7-1.7.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H7.7v-2.4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L9 8.6 10.7 7l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h2.4v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3L19 7l1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v2.4h-.2a1.7 1.7 0 0 0-1.4.9Z" />
                            </svg>
                        </span>

                        Settings
                    </a>
                </div>
            </div>

            {/* User */}
            <div className="border-t border-blue-200/15 p-5">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white ring-1 ring-white/20">
                        PS
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                            Pratik Sinha
                        </p>

                        <p className="truncate text-xs text-blue-200/70">
                            Engineering
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}