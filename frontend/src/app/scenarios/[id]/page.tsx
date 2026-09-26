import RunScenarioButton from "@/components/RunScenarioButton";

type Scenario = {
    id: string;
    name: string;
    description: string;
    environment: string;
    status: string;
};

type ScenarioStep = {
    id: string;
    scenario_id: string;
    step_order: number;
    name: string;
    method: string;
    url: string;
    variable_prefix?: string;
    headers?: Record<string, unknown>;
    query_params?: Record<string, unknown>;
    body?: Record<string, unknown>;
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

function StatusBadge({
    status,
}: {
    status: string;
}) {
    const active =
        status.toLowerCase() === "active";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-zinc-100 text-zinc-600"
            }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                    active
                        ? "bg-emerald-500"
                        : "bg-zinc-400"
                }`}
            />

            {active ? "Active" : status}
        </span>
    );
}

function MethodBadge({
    method,
}: {
    method: string;
}) {
    const normalized = method.toUpperCase();

    const className =
        normalized === "GET"
            ? "bg-blue-50 text-blue-700"
            : normalized === "POST"
              ? "bg-emerald-50 text-emerald-700"
              : normalized === "PUT"
                ? "bg-amber-50 text-amber-700"
                : normalized === "DELETE"
                  ? "bg-red-50 text-red-700"
                  : "bg-zinc-100 text-zinc-600";

    return (
        <span
            className={`inline-flex rounded-md px-2 py-1 font-mono text-[10px] font-semibold ${className}`}
        >
            {normalized}
        </span>
    );
}

function JsonBlock({
    title,
    data,
}: {
    title: string;
    data?: Record<string, unknown>;
}) {
    if (
        !data ||
        Object.keys(data).length === 0
    ) {
        return null;
    }

    return (
        <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-zinc-500">
                {title}
            </p>

            <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs leading-5 text-zinc-700">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}

export default async function ScenarioDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    let scenario: Scenario | null = null;
    let steps: ScenarioStep[] = [];
    let fetchFailed = false;

    try {
        const [
            scenarioResponse,
            stepsResponse,
        ] = await Promise.all([
            fetch(
                `http://127.0.0.1:8080/api/v1/scenarios/${id}`,
                {
                    cache: "no-store",
                }
            ),

            fetch(
                `http://127.0.0.1:8080/api/v1/scenarios/${id}/steps`,
                {
                    cache: "no-store",
                }
            ),
        ]);

        if (scenarioResponse.ok) {
            scenario =
                await scenarioResponse.json();
        }

        if (stepsResponse.ok) {
            const data: ScenarioStep[] =
                await stepsResponse.json();

            steps = Array.isArray(data)
                ? data
                : [];
        }

        if (
            !scenarioResponse.ok ||
            !stepsResponse.ok
        ) {
            fetchFailed = true;
        }
    } catch (error) {
        console.error(
            "Failed to fetch scenario detail:",
            error
        );

        fetchFailed = true;
    }

    /*
     * Scenario not found
     * The parent scenarios/layout.tsx already provides
     * the shared sidebar and page shell.
     */
    if (!scenario) {
        return (
            <>
                <header className="flex min-h-[86px] items-center justify-between border-b border-zinc-200 bg-white px-7 lg:px-9">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
                            Scenario
                        </h1>

                        <p className="mt-1 text-sm text-zinc-500">
                            Scenario details
                        </p>
                    </div>

                    <a
                        href="/scenarios"
                        className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                    >
                        Back to Scenarios
                    </a>
                </header>

                <div className="p-6 lg:p-7">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                        <p className="text-sm font-medium text-red-700">
                            Scenario not found
                        </p>

                        <p className="mt-1 text-xs text-red-600">
                            Unable to load scenario{" "}
                            {id}.
                        </p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Header */}
            <header className="flex min-h-[86px] items-center justify-between border-b border-zinc-200 bg-white px-7 lg:px-9">
                <div>
                    <div className="flex items-center gap-2">
                        <a
                            href="/scenarios"
                            className="text-sm text-zinc-400 transition hover:text-zinc-700"
                        >
                            Scenarios
                        </a>

                        <span className="text-zinc-300">
                            /
                        </span>

                        <span className="font-mono text-xs text-zinc-500">
                            #{scenario.id.slice(
                                0,
                                8
                            )}
                        </span>
                    </div>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-800">
                        {scenario.name}
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Scenario configuration and API steps
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <StatusBadge
                        status={scenario.status}
                    />

                    <a
                        href="/scenarios"
                        className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                    >
                        Back
                    </a>

                    <a
                        href={`/scenarios/${scenario.id}/edit`}
                        className="rounded-lg bg-[#2f80ed] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256fd1]"
                    >
                        Edit Scenario
                    </a>

                    <RunScenarioButton
                        scenarioId={scenario.id}
                        environment={scenario.environment}
                    />
                </div>
            </header>

            <div className="p-6 lg:p-7">
                {fetchFailed && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        Some scenario details could not be loaded.
                    </div>
                )}

                {/* Overview */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                            Status
                        </p>

                        <div className="mt-3">
                            <StatusBadge
                                status={scenario.status}
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                            Environment
                        </p>

                        <div className="mt-3">
                            <EnvironmentBadge
                                environment={
                                    scenario.environment
                                }
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                            Steps
                        </p>

                        <p className="mt-2 text-xl font-semibold text-zinc-900">
                            {steps.length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                            ID
                        </p>

                        <p className="mt-2 break-all font-mono text-xs text-zinc-700">
                            {scenario.id}
                        </p>
                    </div>
                </div>

                {/* Scenario Information */}
                <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-900">
                            Scenario Information
                        </h2>

                        <p className="mt-0.5 text-xs text-zinc-400">
                            Metadata for this scenario
                        </p>
                    </div>

                    <div className="mt-5">
                        <p className="text-xs font-medium text-zinc-400">
                            Description
                        </p>

                        <p className="mt-2 text-sm leading-6 text-zinc-700">
                            {scenario.description ||
                                "No description provided"}
                        </p>
                    </div>
                </section>

                {/* Steps */}
                <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-900">
                                Scenario Steps
                            </h2>

                            <p className="mt-0.5 text-xs text-zinc-400">
                                API requests executed as part of this workflow
                            </p>
                        </div>

                        <a
                            href={`/scenarios/${scenario.id}/steps/new`}
                            className="shrink-0 rounded-lg bg-[#2f80ed] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256fd1]"
                        >
                            Add Step
                        </a>
                    </div>

                    <div className="mt-6">
                        {steps.length > 0 ? (
                            <div className="space-y-4">
                                {steps.map((step) => (
                                    <div
                                        key={step.id}
                                        className="rounded-xl border border-zinc-200 bg-white"
                                    >
                                        <div className="flex flex-col gap-4 border-b border-zinc-200 bg-zinc-50/70 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-semibold text-zinc-700 shadow-sm ring-1 ring-zinc-200">
                                                    {
                                                        step.step_order
                                                    }
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-semibold text-zinc-900">
                                                        {
                                                            step.name
                                                        }
                                                    </h3>

                                                    <p className="mt-1 font-mono text-xs text-zinc-400">
                                                        {step.url}
                                                    </p>
                                                </div>
                                            </div>

                                            <MethodBadge
                                                method={
                                                    step.method
                                                }
                                            />
                                        </div>

                                        <div className="p-5">
                                            <div className="grid gap-5 xl:grid-cols-3">
                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                                                        Endpoint
                                                    </p>

                                                    <p className="mt-2 break-all font-mono text-xs text-zinc-700">
                                                        {
                                                            step.url
                                                        }
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                                                        Variable Prefix
                                                    </p>

                                                    <p className="mt-2 font-mono text-xs text-zinc-700">
                                                        {step.variable_prefix ||
                                                            "-"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                                                        Step ID
                                                    </p>

                                                    <p className="mt-2 break-all font-mono text-xs text-zinc-700">
                                                        {
                                                            step.id
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <JsonBlock
                                                title="Headers"
                                                data={
                                                    step.headers
                                                }
                                            />

                                            <JsonBlock
                                                title="Query Parameters"
                                                data={
                                                    step.query_params
                                                }
                                            />

                                            <JsonBlock
                                                title="Request Body"
                                                data={
                                                    step.body
                                                }
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-zinc-200 px-5 py-12 text-center">
                                <p className="text-sm font-medium text-zinc-700">
                                    No scenario steps found
                                </p>

                                <p className="mt-1 text-xs text-zinc-400">
                                    Add API steps to this scenario to build the workflow.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}