import CloneScenarioButton from "@/components/CloneScenarioButton";

type Scenario = {
    id: string;
    name: string;
    description: string;
    environment: string;
    status: string;
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
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${isTest
                    ? "bg-blue-50 text-blue-700"
                    : "bg-red-50 text-red-700"
                }`}
        >
            {environment}
        </span>
    );
}

function StatusBadge({
    status,
}: {
    status: string;
}) {
    const active =
        status.toLowerCase() === "active";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-zinc-100 text-zinc-600"
                }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${active
                        ? "bg-emerald-500"
                        : "bg-zinc-400"
                    }`}
            />

            {active ? "Active" : status}
        </span>
    );
}

export default async function ScenariosPage() {
    let scenarios: Scenario[] = [];
    let fetchFailed = false;

    try {
        const response = await fetch(
            "http://127.0.0.1:8080/api/v1/scenarios",
            {
                cache: "no-store",
            }
        );

        if (response.ok) {
            const data: Scenario[] =
                await response.json();

            scenarios = Array.isArray(data)
                ? data
                : [];
        } else {
            fetchFailed = true;
        }
    } catch (error) {
        console.error(
            "Failed to fetch scenarios:",
            error
        );

        fetchFailed = true;
    }

    const activeScenarios = scenarios.filter(
        (scenario) =>
            scenario.status === "active"
    ).length;

    const environments = new Set(
        scenarios.map(
            (scenario) => scenario.environment
        )
    ).size;

    return (
        <>
            <header className="flex min-h-[86px] items-center justify-between border-b border-zinc-200 bg-white px-7 lg:px-9">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-400">
                            Workspace
                        </span>

                        <span className="text-zinc-300">
                            /
                        </span>

                        <span className="font-mono text-xs text-zinc-500">
                            Scenarios
                        </span>
                    </div>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-800">
                        Scenarios
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Create and manage reusable integration workflows
                    </p>
                </div>

                <a
                    href="/scenarios/new"
                    className="rounded-lg bg-[#2f80ed] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256fd1]"
                >
                    New Scenario
                </a>
            </header>

            <div className="p-6 lg:p-7">
                {fetchFailed && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        Unable to connect to the backend. Make sure the Go server is running on port 8080.
                    </div>
                )}

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">
                                    Total Scenarios
                                </p>

                                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-800">
                                    {scenarios.length}
                                </p>

                                <p className="mt-1.5 text-xs text-zinc-400">
                                    All saved scenarios
                                </p>
                            </div>

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-5 w-5"
                                >
                                    <rect
                                        x="4"
                                        y="4"
                                        width="16"
                                        height="16"
                                        rx="2"
                                    />
                                    <path d="M8 9h8M8 13h6M8 17h4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">
                                    Active Scenarios
                                </p>

                                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-800">
                                    {activeScenarios}
                                </p>

                                <p className="mt-1.5 text-xs text-zinc-400">
                                    Currently available
                                </p>
                            </div>

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
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
                                        r="8.5"
                                    />
                                    <path d="m8.5 12 2.2 2.2 4.8-5" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">
                                    Environments
                                </p>

                                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-800">
                                    {environments}
                                </p>

                                <p className="mt-1.5 text-xs text-zinc-400">
                                    Test and live configurations
                                </p>
                            </div>

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
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
                                        r="8.5"
                                    />
                                    <path d="M3.5 12h17M12 3.5c2.4 2.4 3.7 5.3 3.7 8.5S14.4 18.1 12 20.5c-2.4-2.4-3.7-5.3-3.7-8.5S9.6 5.9 12 3.5Z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scenario Library */}
                <section className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                    <div className="flex flex-col gap-4 border-b border-zinc-200 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-900">
                                Scenario Library
                            </h2>

                            <p className="mt-0.5 text-xs text-zinc-400">
                                Reusable payment integration workflows
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2">
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4 text-zinc-400"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <circle
                                        cx="11"
                                        cy="11"
                                        r="7"
                                    />
                                    <path d="m20 20-4-4" />
                                </svg>

                                <input
                                    type="text"
                                    placeholder="Search scenarios"
                                    className="w-48 bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
                                />
                            </div>

                            <button className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50">
                                Filter
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left">
                            <thead>
                                <tr className="border-b border-zinc-100 bg-zinc-50/70">
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                                        Scenario
                                    </th>

                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                                        Environment
                                    </th>

                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                                        Scenario ID
                                    </th>

                                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {scenarios.length > 0 ? (
                                    scenarios.map(
                                        (scenario) => (
                                            <tr
                                                key={scenario.id}
                                                className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/50"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-semibold text-zinc-800">
                                                        {scenario.name}
                                                    </p>

                                                    <p className="mt-1 max-w-md truncate text-xs text-zinc-400">
                                                        {scenario.description ||
                                                            "No description provided"}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <EnvironmentBadge
                                                        environment={
                                                            scenario.environment
                                                        }
                                                    />
                                                </td>

                                                <td className="px-5 py-4">
                                                    <StatusBadge
                                                        status={
                                                            scenario.status
                                                        }
                                                    />
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="font-mono text-xs text-zinc-500">
                                                        {scenario.id}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <a
                                                            href={`/scenarios/${scenario.id}`}
                                                            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
                                                        >
                                                            View
                                                        </a>

                                                        <CloneScenarioButton
                                                            scenarioId={scenario.id}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-16 text-center"
                                        >
                                            <div className="mx-auto max-w-sm">
                                                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                    >
                                                        <rect
                                                            x="3"
                                                            y="4"
                                                            width="18"
                                                            height="16"
                                                            rx="2"
                                                        />
                                                        <path d="M8 9h8" />
                                                        <path d="M8 13h5" />
                                                        <path d="M8 17h3" />
                                                    </svg>
                                                </div>

                                                <p className="mt-3 text-sm font-medium text-zinc-700">
                                                    No scenarios found
                                                </p>

                                                <p className="mt-1 text-xs text-zinc-400">
                                                    Create your first integration scenario to get started.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3">
                        <p className="text-xs text-zinc-400">
                            Showing {scenarios.length} scenario
                            {scenarios.length === 1
                                ? ""
                                : "s"}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                disabled
                                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-300"
                            >
                                Previous
                            </button>

                            <button
                                disabled
                                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-300"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}