type Credential = {
    id: string;
    name: string;
    environment: string;
    key_id: string;
};

function EnvironmentBadge({
    environment,
}: {
    environment: string;
}) {
    const isTest =
        environment.toLowerCase() === "test" ||
        environment.toLowerCase() === "sandbox";

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                isTest
                    ? "bg-blue-50 text-blue-700"
                    : "bg-red-50 text-red-700"
            }`}
        >
            {environment}
        </span>
    );
}

function MaskKey(key: string) {
    if (!key) {
        return "••••••••";
    }

    if (key.length <= 8) {
        return "••••••••";
    }

    return `${key.slice(0, 8)}••••••••`;
}

export default async function SettingsPage() {
    let credentials: Credential[] = [];
    let fetchFailed = false;

    try {
        const response = await fetch(
            "http://127.0.0.1:8080/api/v1/credentials",
            {
                cache: "no-store",
            }
        );

        if (!response.ok) {
            fetchFailed = true;
        } else {
            const data: Credential[] =
                await response.json();

            credentials = Array.isArray(data)
                ? data
                : [];
        }
    } catch (error) {
        console.error(
            "Failed to fetch credentials:",
            error
        );

        fetchFailed = true;
    }

    return (
        <>
            {/* Header */}
            <header className="flex min-h-[86px] items-center justify-between border-b border-zinc-200 bg-white px-7 lg:px-9">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-400">
                            Configuration
                        </span>

                        <span className="text-zinc-300">
                            /
                        </span>

                        <span className="font-mono text-xs text-zinc-500">
                            Settings
                        </span>
                    </div>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-800">
                        Settings
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Manage credentials and integration configuration
                    </p>
                </div>
            </header>

            <div className="p-6 lg:p-7">
                {fetchFailed && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        Failed to load credentials from the backend.
                    </div>
                )}

                {/* Credentials */}
                <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-base font-semibold text-slate-800">
                                Credentials
                            </h2>

                            <p className="mt-0.5 text-xs text-zinc-400">
                                Razorpay API credentials available for replay execution
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                                {credentials.length}{" "}
                                {credentials.length === 1
                                    ? "credential"
                                    : "credentials"}
                            </span>

                            <a
                                href="/settings/credentials/new"
                                className="rounded-lg bg-[#2f80ed] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256fd1]"
                            >
                                Add Credential
                            </a>
                        </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200">
                        {credentials.length > 0 ? (
                            <div className="divide-y divide-zinc-200">
                                {credentials.map(
                                    (credential) => (
                                        <div
                                            key={
                                                credential.id
                                            }
                                            className="flex flex-col gap-4 px-5 py-4 transition hover:bg-zinc-50/70 md:flex-row md:items-center md:justify-between"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <p className="text-sm font-semibold text-zinc-900">
                                                        {
                                                            credential.name
                                                        }
                                                    </p>

                                                    <EnvironmentBadge
                                                        environment={
                                                            credential.environment
                                                        }
                                                    />
                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <span className="text-xs text-zinc-400">
                                                        Key ID
                                                    </span>

                                                    <span className="font-mono text-xs text-zinc-600">
                                                        {MaskKey(
                                                            credential.key_id
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-[11px] text-zinc-500">
                                                    ID:{" "}
                                                    {credential.id.slice(
                                                        0,
                                                        8
                                                    )}
                                                    ...
                                                </span>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="px-5 py-14 text-center">
                                <p className="text-sm font-medium text-zinc-700">
                                    No credentials found
                                </p>

                                <p className="mt-1 text-xs text-zinc-400">
                                    Add a credential to use it for API replay.
                                </p>

                                <a
                                    href="/settings/credentials/new"
                                    className="mt-4 inline-flex rounded-lg bg-[#2f80ed] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256fd1]"
                                >
                                    Add Credential
                                </a>
                            </div>
                        )}
                    </div>
                </section>

                {/* Security Note */}
                <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                    <div className="flex gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-4 w-4"
                            >
                                <rect
                                    x="5"
                                    y="10"
                                    width="14"
                                    height="10"
                                    rx="2"
                                />
                                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                            </svg>
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-zinc-900">
                                Credential Security
                            </h2>

                            <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-500">
                                Secret keys are stored by the backend and are not exposed in the credential listing. They are resolved when required for replay execution.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}