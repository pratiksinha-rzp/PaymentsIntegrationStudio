type Execution = {
    id: string;
    scenario_id?: string;
    scenario_name?: string;
    credential_id: string;
    status: string;
    trigger_type: string;
    started_at?: string;
    completed_at?: string;
    duration_ms?: number;
    step_count?: number;
};

function formatDuration(durationMs?: number) {
    if (!durationMs) {
        return "0.00s";
    }

    return `${(durationMs / 1000).toFixed(2)}s`;
}

function formatDateTime(dateString?: string) {
    if (!dateString) {
        return "-";
    }

    return new Date(dateString).toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Kolkata",
        }
    );
}

function formatTimeAgo(dateString?: string) {
    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();

    const diffSeconds = Math.max(
        0,
        Math.floor(diffMs / 1000)
    );

    if (diffSeconds < 60) {
        return "Just now";
    }

    const diffMinutes = Math.floor(
        diffSeconds / 60
    );

    if (diffMinutes < 60) {
        return `${diffMinutes} min ago`;
    }

    const diffHours = Math.floor(
        diffMinutes / 60
    );

    if (diffHours < 24) {
        return `${diffHours} hr ago`;
    }

    const diffDays = Math.floor(
        diffHours / 24
    );

    return `${diffDays} day${
        diffDays === 1 ? "" : "s"
    } ago`;
}

function formatTrigger(triggerType: string) {
    if (triggerType === "api_replay") {
        return "API Replay";
    }

    return triggerType
        .replace(/_/g, " ")
        .replace(/\b\w/g, (character) =>
            character.toUpperCase()
        );
}

function getExecutionSource(execution: Execution) {
    if (execution.trigger_type === "api_replay") {
        return {
            name: "API Replay",
            description: "Standalone API Request",
        };
    }

    return {
        name:
            execution.scenario_name ||
            "Unnamed Scenario",
        description:
            execution.scenario_id || "-",
    };
}

function StatusBadge({
    status,
}: {
    status: string;
}) {
    const normalizedStatus =
        status.toLowerCase();

    const success =
        normalizedStatus === "success";

    const pending =
        normalizedStatus === "pending";

    const running =
        normalizedStatus === "running";

    if (pending) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Pending
            </span>
        );
    }

    if (running) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Running
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
                success
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
            }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                    success
                        ? "bg-emerald-500"
                        : "bg-red-500"
                }`}
            />

            {success ? "Success" : "Failed"}
        </span>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    icon,
    iconClassName,
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    iconClassName?: string;
}) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-600">
                        {title}
                    </p>

                    <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-800">
                        {value}
                    </p>

                    <p className="mt-1.5 text-xs text-zinc-400">
                        {subtitle}
                    </p>
                </div>

                <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        iconClassName ??
                        "bg-blue-50 text-blue-500"
                    }`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default async function ExecutionsPage() {
    let executions: Execution[] = [];
    let fetchFailed = false;

    try {
        const response = await fetch(
            "http://127.0.0.1:8080/api/v1/executions",
            {
                cache: "no-store",
            }
        );

        if (response.ok) {
            const data: Execution[] =
                await response.json();

            executions = Array.isArray(data)
                ? data
                : [];
        } else {
            fetchFailed = true;
        }
    } catch (error) {
        console.error(
            "Failed to fetch executions:",
            error
        );

        fetchFailed = true;
    }

    const totalExecutions =
        executions.length;

    const successfulExecutions =
        executions.filter(
            (execution) =>
                execution.status === "success"
        ).length;

    const failedExecutions =
        executions.filter(
            (execution) =>
                execution.status === "failed"
        ).length;

    const pendingExecutions =
        executions.filter(
            (execution) =>
                execution.status === "pending"
        ).length;

    const successRate =
        totalExecutions > 0
            ? (
                  (successfulExecutions /
                      totalExecutions) *
                  100
              ).toFixed(1)
            : "0.0";

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
                            History
                        </span>
                    </div>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-800">
                        Execution History
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        View and inspect scenario execution history
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href="/"
                        className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                    >
                        Dashboard
                    </a>

                    <a
                        href="/executions"
                        className="rounded-lg bg-[#2f80ed] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256fd1]"
                    >
                        ↻ Refresh
                    </a>
                </div>
            </header>

            <div className="p-6 lg:p-7">
                {fetchFailed && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        Unable to connect to the backend. Make sure the Go server is running on port 8080.
                    </div>
                )}

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Executions"
                        value={String(
                            totalExecutions
                        )}
                        subtitle="All recorded executions"
                        icon={
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-5 w-5"
                            >
                                <path d="M5 5h14v14H5z" />
                                <path d="M8 9h8M8 12h8M8 15h5" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Successful"
                        value={String(
                            successfulExecutions
                        )}
                        subtitle={`${successRate}% success rate`}
                        iconClassName="bg-emerald-50 text-emerald-600"
                        icon={
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
                        }
                    />

                    <StatCard
                        title="Failed"
                        value={String(
                            failedExecutions
                        )}
                        subtitle="Failed executions"
                        iconClassName="bg-red-50 text-red-500"
                        icon={
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
                                <path d="m9 9 6 6M15 9l-6 6" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Pending"
                        value={String(
                            pendingExecutions
                        )}
                        subtitle="Awaiting completion"
                        iconClassName="bg-amber-50 text-amber-600"
                        icon={
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
                                <path d="M12 7v5l3 2" />
                            </svg>
                        }
                    />
                </div>

                {/* Execution History */}
                <section className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                    <div className="flex flex-col gap-4 border-b border-zinc-200 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-900">
                                Execution History
                            </h2>

                            <p className="mt-0.5 text-xs text-zinc-400">
                                Complete list of scenario runs
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
                                    placeholder="Search executions"
                                    className="w-48 bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
                                />
                            </div>

                            <button className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50">
                                Filter
                            </button>

                            <button className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50">
                                Export
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px] text-left">
                            <thead>
                                <tr className="border-b border-zinc-100 bg-zinc-50/70">
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                                        Execution
                                    </th>

                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                                        Scenario
                                    </th>

                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                                        Duration
                                    </th>

                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                                        Steps
                                    </th>

                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                                        Trigger
                                    </th>

                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                                        Started
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {executions.length > 0 ? (
                                    executions.map(
                                        (execution) => {
                                            const source =
                                                getExecutionSource(
                                                    execution
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        execution.id
                                                    }
                                                    className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/50"
                                                >
                                                    <td className="px-5 py-4">
                                                        <a
                                                            href={`/executions/${execution.id}`}
                                                            className="font-mono text-xs font-medium text-zinc-700 hover:text-[#2f80ed] hover:underline"
                                                        >
                                                            #
                                                            {execution.id.slice(
                                                                0,
                                                                8
                                                            )}
                                                        </a>

                                                        <p className="mt-1 text-[11px] text-zinc-400">
                                                            {
                                                                execution.id
                                                            }
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-medium text-zinc-800">
                                                            {
                                                                source.name
                                                            }
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-zinc-400">
                                                            {
                                                                source.description
                                                            }
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <StatusBadge
                                                            status={
                                                                execution.status
                                                            }
                                                        />
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-zinc-600">
                                                        {formatDuration(
                                                            execution.duration_ms
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-zinc-600">
                                                        {execution.step_count ??
                                                            0}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="text-sm text-zinc-500">
                                                            {formatTrigger(
                                                                execution.trigger_type
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm text-zinc-600">
                                                            {formatTimeAgo(
                                                                execution.started_at
                                                            )}
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-zinc-400">
                                                            {formatDateTime(
                                                                execution.started_at
                                                            )}
                                                        </p>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={
                                                7
                                            }
                                            className="px-5 py-16 text-center"
                                        >
                                            <p className="text-sm font-medium text-zinc-700">
                                                No executions found
                                            </p>

                                            <p className="mt-1 text-xs text-zinc-400">
                                                Run a scenario to see execution history here.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3">
                        <p className="text-xs text-zinc-400">
                            Showing{" "}
                            {executions.length}{" "}
                            execution
                            {executions.length ===
                            1
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