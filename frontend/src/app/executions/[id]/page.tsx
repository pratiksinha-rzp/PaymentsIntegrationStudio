import ReplayExecutionButton from "@/components/ReplayExecutionButton";

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

type ExecutionStep = {
    id: string;
    execution_id: string;
    scenario_step_id?: string;
    scenario_step_name?: string;
    step_order: number;
    status: string;
    status_code?: number;
    request_url?: string;
    request_method?: string;
    request_headers?: Record<string, unknown>;
    request_query_params?: Record<string, unknown>;
    request_body?: Record<string, unknown>;
    variables_resolved?: Record<string, unknown>;
    response_headers?: Record<string, string>;
    response_body?: Record<string, unknown>;
    error?: string;
    latency_ms?: number;
    started_at?: string;
    completed_at?: string;
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

function StatusBadge({
    status,
}: {
    status: string;
}) {
    const success = status === "success";
    const pending = status === "pending";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${success
                    ? "bg-emerald-50 text-emerald-700"
                    : pending
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-700"
                }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${success
                        ? "bg-emerald-500"
                        : pending
                            ? "bg-amber-500"
                            : "bg-red-500"
                    }`}
            />

            {success
                ? "Success"
                : pending
                    ? "Pending"
                    : "Failed"}
        </span>
    );
}

function StepStatusIcon({
    status,
}: {
    status: string;
}) {
    const success = status === "success";
    const pending = status === "pending";

    return (
        <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${success
                    ? "bg-emerald-50 text-emerald-600"
                    : pending
                        ? "bg-amber-50 text-amber-600"
                        : "bg-red-50 text-red-600"
                }`}
        >
            {success ? (
                <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="m5 12 4 4L19 6" />
                </svg>
            ) : pending ? (
                <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="8"
                    />

                    <path d="M12 8v4l2 2" />
                </svg>
            ) : (
                <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M7 7l10 10" />
                    <path d="M17 7 7 17" />
                </svg>
            )}
        </div>
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

function getExecutionTitle(
    execution: Execution
) {
    if (
        execution.trigger_type ===
        "api_replay"
    ) {
        return "API Replay";
    }

    return (
        execution.scenario_name ||
        "Execution"
    );
}

function getStepTitle(
    execution: Execution,
    step: ExecutionStep
) {
    if (
        execution.trigger_type ===
        "api_replay"
    ) {
        return "API Request";
    }

    return (
        step.scenario_step_name ||
        "API Request"
    );
}

export default async function ExecutionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    let execution: Execution | null = null;
    let steps: ExecutionStep[] = [];
    let fetchFailed = false;

    try {
        const [
            executionResponse,
            stepsResponse,
        ] = await Promise.all([
            fetch(
                `http://127.0.0.1:8080/api/v1/executions/${id}`,
                {
                    cache: "no-store",
                }
            ),

            fetch(
                `http://127.0.0.1:8080/api/v1/executions/${id}/steps`,
                {
                    cache: "no-store",
                }
            ),
        ]);

        if (executionResponse.ok) {
            execution =
                await executionResponse.json();
        }

        if (stepsResponse.ok) {
            const data: ExecutionStep[] =
                await stepsResponse.json();

            steps = Array.isArray(data)
                ? data
                : [];
        }

        if (
            !executionResponse.ok ||
            !stepsResponse.ok
        ) {
            fetchFailed = true;
        }
    } catch (error) {
        console.error(
            "Failed to fetch execution detail:",
            error
        );

        fetchFailed = true;
    }

    if (!execution) {
        return (
            <>
                <header className="flex min-h-[86px] items-center justify-between border-b border-zinc-200 bg-white px-7 lg:px-9">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
                            Execution
                        </h1>

                        <p className="mt-1 text-sm text-zinc-500">
                            Execution details
                        </p>
                    </div>

                    <a
                        href="/executions"
                        className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                    >
                        Back to Executions
                    </a>
                </header>

                <div className="p-6 lg:p-7">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                        <p className="text-sm font-medium text-red-700">
                            Execution not found
                        </p>

                        <p className="mt-1 text-xs text-red-600">
                            Unable to load execution{" "}
                            {id}.
                        </p>
                    </div>
                </div>
            </>
        );
    }

    const successfulSteps =
        steps.filter(
            (step) =>
                step.status === "success"
        ).length;

    const executionTitle =
        getExecutionTitle(execution);

    return (
        <>
            {/* Header */}
            <header className="flex min-h-[86px] items-center justify-between border-b border-zinc-200 bg-white px-7 lg:px-9">
                <div>
                    <div className="flex items-center gap-2">
                        <a
                            href="/executions"
                            className="text-sm text-zinc-400 transition hover:text-zinc-700"
                        >
                            Executions
                        </a>

                        <span className="text-zinc-300">
                            /
                        </span>

                        <span className="font-mono text-xs text-zinc-500">
                            #
                            {execution.id.slice(
                                0,
                                8
                            )}
                        </span>
                    </div>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-800">
                        {executionTitle}
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Execution details and timeline
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <StatusBadge
                        status={
                            execution.status
                        }
                    />

                    <a
                        href="/executions"
                        className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                    >
                        Back
                    </a>

                    {execution.trigger_type === "api_replay" &&
                    steps.length > 0 ? (
                        <ReplayExecutionButton
                            executionId={execution.id}
                            credentialId={execution.credential_id}
                            method={
                                steps[0].request_method ||
                                "POST"
                            }
                            url={steps[0].request_url || ""}
                            headers={
                                steps[0].request_headers
                            }
                            queryParams={
                                steps[0].request_query_params
                            }
                            body={
                                steps[0].request_body
                            }
                        />
                    ) : (
                        <button
                            type="button"
                            disabled
                            className="cursor-not-allowed rounded-lg bg-[#2f80ed] px-4 py-2.5 text-sm font-semibold text-white opacity-50"
                            title="Replay is currently available for API Replay executions"
                        >
                            Replay
                        </button>
                    )}
                </div>
            </header>

            <div className="p-6 lg:p-7">
                {fetchFailed && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        Some execution details could not be loaded.
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
                                status={
                                    execution.status
                                }
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                            Duration
                        </p>

                        <p className="mt-2 text-xl font-semibold text-zinc-900">
                            {formatDuration(
                                execution.duration_ms
                            )}
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                            Steps
                        </p>

                        <p className="mt-2 text-xl font-semibold text-zinc-900">
                            {successfulSteps}/
                            {execution.step_count ??
                                steps.length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                            Trigger
                        </p>

                        <p className="mt-2 text-xl font-semibold text-zinc-900">
                            {formatTrigger(
                                execution.trigger_type
                            )}
                        </p>
                    </div>
                </div>

                {/* Execution Information */}
                <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-900">
                            Execution Information
                        </h2>

                        <p className="mt-0.5 text-xs text-zinc-400">
                            Metadata for this execution
                        </p>
                    </div>

                    <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <p className="text-xs text-zinc-400">
                                Execution ID
                            </p>

                            <p className="mt-1 break-all font-mono text-xs text-zinc-700">
                                {execution.id}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-zinc-400">
                                Scenario ID
                            </p>

                            <p className="mt-1 break-all font-mono text-xs text-zinc-700">
                                {execution.scenario_id ||
                                    "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-zinc-400">
                                Started At
                            </p>

                            <p className="mt-1 text-sm text-zinc-700">
                                {formatDateTime(
                                    execution.started_at
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-zinc-400">
                                Completed At
                            </p>

                            <p className="mt-1 text-sm text-zinc-700">
                                {formatDateTime(
                                    execution.completed_at
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-900">
                            Execution Timeline
                        </h2>

                        <p className="mt-0.5 text-xs text-zinc-400">
                            Request, response and timing for each step
                        </p>
                    </div>

                    <div className="mt-6">
                        {steps.length > 0 ? (
                            <div className="space-y-6">
                                {steps.map(
                                    (
                                        step,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                step.id
                                            }
                                            className="relative"
                                        >
                                            {index <
                                                steps.length -
                                                1 && (
                                                    <div className="absolute left-[18px] top-9 h-[calc(100%+24px)] w-px bg-zinc-200" />
                                                )}

                                            <div className="relative flex gap-4">
                                                <StepStatusIcon
                                                    status={
                                                        step.status
                                                    }
                                                />

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="text-sm font-semibold text-zinc-900">
                                                                    {
                                                                        step.step_order
                                                                    }
                                                                    .{" "}
                                                                    {getStepTitle(
                                                                        execution,
                                                                        step
                                                                    )}
                                                                </h3>

                                                                <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-500">
                                                                    {step.status_code ??
                                                                        "-"}
                                                                </span>
                                                            </div>

                                                            <p className="mt-1 font-mono text-xs text-zinc-400">
                                                                {step.request_url ||
                                                                    "-"}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <StatusBadge
                                                                status={
                                                                    step.status
                                                                }
                                                            />

                                                            <span className="text-xs text-zinc-400">
                                                                {step.latency_ms ??
                                                                    0}{" "}
                                                                ms
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 grid gap-4 xl:grid-cols-2">
                                                        {/* Request */}
                                                        <div className="rounded-lg border border-zinc-200">
                                                            <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2.5">
                                                                <p className="text-xs font-medium text-zinc-600">
                                                                    Request
                                                                </p>
                                                            </div>

                                                            <div className="p-4">
                                                                <p className="font-mono text-xs font-medium text-zinc-500">
                                                                    {step.request_url ||
                                                                        "-"}
                                                                </p>

                                                                <JsonBlock
                                                                    title="Headers"
                                                                    data={
                                                                        step.request_headers
                                                                    }
                                                                />

                                                                <JsonBlock
                                                                    title="Query Params"
                                                                    data={
                                                                        step.request_query_params
                                                                    }
                                                                />

                                                                <JsonBlock
                                                                    title="Body"
                                                                    data={
                                                                        step.request_body
                                                                    }
                                                                />

                                                                <JsonBlock
                                                                    title="Resolved Variables"
                                                                    data={
                                                                        step.variables_resolved
                                                                    }
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Response */}
                                                        <div className="rounded-lg border border-zinc-200">
                                                            <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2.5">
                                                                <p className="text-xs font-medium text-zinc-600">
                                                                    Response
                                                                </p>
                                                            </div>

                                                            <div className="p-4">
                                                                <JsonBlock
                                                                    title="Headers"
                                                                    data={
                                                                        step.response_headers
                                                                    }
                                                                />

                                                                <JsonBlock
                                                                    title="Body"
                                                                    data={
                                                                        step.response_body
                                                                    }
                                                                />

                                                                {step.error && (
                                                                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                                                                        <p className="text-xs font-medium text-red-700">
                                                                            Error
                                                                        </p>

                                                                        <p className="mt-1 text-xs text-red-600">
                                                                            {
                                                                                step.error
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-400">
                                                        <span>
                                                            Started:{" "}
                                                            {formatDateTime(
                                                                step.started_at
                                                            )}
                                                        </span>

                                                        <span>
                                                            Completed:{" "}
                                                            {formatDateTime(
                                                                step.completed_at
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-zinc-200 px-5 py-12 text-center">
                                <p className="text-sm font-medium text-zinc-700">
                                    No execution steps found
                                </p>

                                <p className="mt-1 text-xs text-zinc-400">
                                    This execution does not have any recorded steps.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}