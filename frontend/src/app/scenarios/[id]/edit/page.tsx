import { redirect } from "next/navigation";

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

function formatJson(data?: Record<string, unknown>) {
    if (!data || Object.keys(data).length === 0) {
        return "";
    }

    return JSON.stringify(data, null, 2);
}

function parseJson(
    value: string,
    fieldName: string
) {
    const trimmed = value.trim();

    if (!trimmed) {
        return {};
    }

    try {
        const parsed = JSON.parse(trimmed);

        if (
            parsed === null ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
        ) {
            throw new Error(
                `${fieldName} must be a JSON object`
            );
        }

        return parsed as Record<
            string,
            unknown
        >;
    } catch {
        throw new Error(
            `Invalid JSON in ${fieldName}`
        );
    }
}

export default async function EditScenarioPage({
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
            "Failed to fetch scenario for editing:",
            error
        );

        fetchFailed = true;
    }

    if (!scenario) {
        return (
            <>
                <header className="flex min-h-[86px] items-center justify-between border-b border-zinc-200 bg-white px-7 lg:px-9">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
                            Scenario
                        </h1>

                        <p className="mt-1 text-sm text-zinc-500">
                            Edit scenario configuration
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
                    <div className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-6">
                        <p className="text-sm font-semibold text-red-700">
                            Scenario not found
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                            Unable to load scenario{" "}
                            {id}.
                        </p>

                        <a
                            href="/scenarios"
                            className="mt-5 inline-flex rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                        >
                            Back to Scenarios
                        </a>
                    </div>
                </div>
            </>
        );
    }

    async function saveScenario(
        formData: FormData
    ) {
        "use server";

        const name = String(
            formData.get("name") ?? ""
        ).trim();

        const description = String(
            formData.get("description") ?? ""
        ).trim();

        const environment = String(
            formData.get("environment") ?? "test"
        ).trim();

        if (!name) {
            throw new Error(
                "Scenario name is required"
            );
        }

        // ---------------------------------------------------------------------
        // Update scenario
        // ---------------------------------------------------------------------

        const scenarioResponse =
            await fetch(
                `http://127.0.0.1:8080/api/v1/scenarios/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        description,
                        environment,
                    }),
                }
            );

        if (!scenarioResponse.ok) {
            const errorText =
                await scenarioResponse.text();

            throw new Error(
                errorText ||
                    "Failed to update scenario"
            );
        }

        // ---------------------------------------------------------------------
        // Update scenario steps
        // ---------------------------------------------------------------------

        for (const step of steps) {
            const stepName = String(
                formData.get(
                    `step_${step.id}_name`
                ) ?? ""
            ).trim();

            const stepMethod = String(
                formData.get(
                    `step_${step.id}_method`
                ) ?? ""
            ).trim();

            const stepURL = String(
                formData.get(
                    `step_${step.id}_url`
                ) ?? ""
            ).trim();

            const variablePrefix = String(
                formData.get(
                    `step_${step.id}_variable_prefix`
                ) ?? ""
            ).trim();

            const headersText = String(
                formData.get(
                    `step_${step.id}_headers`
                ) ?? ""
            );

            const queryParamsText = String(
                formData.get(
                    `step_${step.id}_query_params`
                ) ?? ""
            );

            const bodyText = String(
                formData.get(
                    `step_${step.id}_body`
                ) ?? ""
            );

            if (!stepName) {
                throw new Error(
                    `Step ${step.step_order}: step name is required`
                );
            }

            if (!stepMethod) {
                throw new Error(
                    `Step ${step.step_order}: method is required`
                );
            }

            if (!stepURL) {
                throw new Error(
                    `Step ${step.step_order}: endpoint is required`
                );
            }

            const headers = parseJson(
                headersText,
                `Step ${step.step_order} Headers`
            );

            const queryParams = parseJson(
                queryParamsText,
                `Step ${step.step_order} Query Parameters`
            );

            const body = parseJson(
                bodyText,
                `Step ${step.step_order} Request Body`
            );

            const stepResponse =
                await fetch(
                    `http://127.0.0.1:8080/api/v1/scenarios/${id}/steps/${step.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            id: step.id,
                            scenario_id: id,
                            step_order:
                                step.step_order,
                            name: stepName,
                            method: stepMethod,
                            url: stepURL,
                            variable_prefix:
                                variablePrefix,
                            headers,
                            query_params:
                                queryParams,
                            body,
                        }),
                    }
                );

            if (!stepResponse.ok) {
                const errorText =
                    await stepResponse.text();

                throw new Error(
                    errorText ||
                        `Failed to update step ${step.step_order}`
                );
            }
        }

        redirect(`/scenarios/${id}`);
    }

    return (
        <>
            <form action={saveScenario}>
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

                            <span className="text-sm text-zinc-400">
                                {scenario.name}
                            </span>

                            <span className="text-zinc-300">
                                /
                            </span>

                            <span className="font-mono text-xs text-zinc-500">
                                Edit
                            </span>
                        </div>

                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-800">
                            Edit Scenario
                        </h1>

                        <p className="mt-1 text-sm text-zinc-500">
                            Modify scenario configuration and API steps
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={`/scenarios/${scenario.id}`}
                            className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                        >
                            Cancel
                        </a>

                        <button
                            type="submit"
                            className="rounded-lg bg-[#2f80ed] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256fd1]"
                        >
                            Save Changes
                        </button>
                    </div>
                </header>

                <div className="p-6 lg:p-7">
                    {fetchFailed && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            Some scenario details could not be loaded.
                        </div>
                    )}

                    {/* Scenario Details */}
                    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <div>
                            <h2 className="text-base font-semibold text-slate-800">
                                Scenario Details
                            </h2>

                            <p className="mt-0.5 text-xs text-zinc-400">
                                Basic configuration
                            </p>
                        </div>

                        <div className="mt-5 grid gap-5 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="text-xs font-medium text-zinc-500"
                                >
                                    Scenario Name
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    defaultValue={
                                        scenario.name
                                    }
                                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="environment"
                                    className="text-xs font-medium text-zinc-500"
                                >
                                    Environment
                                </label>

                                <select
                                    id="environment"
                                    name="environment"
                                    defaultValue={
                                        scenario.environment
                                    }
                                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="test">
                                        test
                                    </option>

                                    <option value="live">
                                        live
                                    </option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label
                                    htmlFor="description"
                                    className="text-xs font-medium text-zinc-500"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    defaultValue={
                                        scenario.description
                                    }
                                    rows={4}
                                    className="mt-2 w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Scenario Steps */}
                    <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <div>
                            <h2 className="text-base font-semibold text-slate-800">
                                Scenario Steps
                            </h2>

                            <p className="mt-0.5 text-xs text-zinc-400">
                                API requests configured in this scenario
                            </p>
                        </div>

                        <div className="mt-6 space-y-4">
                            {steps.map((step) => (
                                <div
                                    key={step.id}
                                    className="rounded-xl border border-zinc-200"
                                >
                                    <div className="flex flex-col gap-4 border-b border-zinc-200 bg-zinc-50/70 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200">
                                                {
                                                    step.step_order
                                                }
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-xs text-zinc-400">
                                                    Step{" "}
                                                    {
                                                        step.step_order
                                                    }
                                                </p>

                                                <h3 className="text-sm font-semibold text-zinc-900">
                                                    {step.name}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="grid gap-5 md:grid-cols-2">
                                            <div>
                                                <label
                                                    htmlFor={`step_${step.id}_name`}
                                                    className="text-xs font-medium text-zinc-500"
                                                >
                                                    Step Name
                                                </label>

                                                <input
                                                    id={`step_${step.id}_name`}
                                                    name={`step_${step.id}_name`}
                                                    defaultValue={
                                                        step.name
                                                    }
                                                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor={`step_${step.id}_method`}
                                                    className="text-xs font-medium text-zinc-500"
                                                >
                                                    Method
                                                </label>

                                                <select
                                                    id={`step_${step.id}_method`}
                                                    name={`step_${step.id}_method`}
                                                    defaultValue={
                                                        step.method
                                                    }
                                                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                                >
                                                    <option value="GET">
                                                        GET
                                                    </option>

                                                    <option value="POST">
                                                        POST
                                                    </option>

                                                    <option value="PUT">
                                                        PUT
                                                    </option>

                                                    <option value="PATCH">
                                                        PATCH
                                                    </option>

                                                    <option value="DELETE">
                                                        DELETE
                                                    </option>
                                                </select>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label
                                                    htmlFor={`step_${step.id}_url`}
                                                    className="text-xs font-medium text-zinc-500"
                                                >
                                                    Endpoint
                                                </label>

                                                <input
                                                    id={`step_${step.id}_url`}
                                                    name={`step_${step.id}_url`}
                                                    defaultValue={
                                                        step.url
                                                    }
                                                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-xs text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor={`step_${step.id}_variable_prefix`}
                                                    className="text-xs font-medium text-zinc-500"
                                                >
                                                    Variable Prefix
                                                </label>

                                                <input
                                                    id={`step_${step.id}_variable_prefix`}
                                                    name={`step_${step.id}_variable_prefix`}
                                                    defaultValue={
                                                        step.variable_prefix ||
                                                        ""
                                                    }
                                                    placeholder="e.g. order"
                                                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-xs text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor={`step_${step.id}_id`}
                                                    className="text-xs font-medium text-zinc-500"
                                                >
                                                    Step ID
                                                </label>

                                                <input
                                                    id={`step_${step.id}_id`}
                                                    value={
                                                        step.id
                                                    }
                                                    readOnly
                                                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 font-mono text-xs text-zinc-500 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <label
                                                htmlFor={`step_${step.id}_headers`}
                                                className="text-xs font-medium text-zinc-500"
                                            >
                                                Headers
                                            </label>

                                            <textarea
                                                id={`step_${step.id}_headers`}
                                                name={`step_${step.id}_headers`}
                                                defaultValue={formatJson(
                                                    step.headers
                                                )}
                                                rows={5}
                                                placeholder="{}"
                                                className="mt-2 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-3 font-mono text-xs leading-5 text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>

                                        <div className="mt-5">
                                            <label
                                                htmlFor={`step_${step.id}_query_params`}
                                                className="text-xs font-medium text-zinc-500"
                                            >
                                                Query Parameters
                                            </label>

                                            <textarea
                                                id={`step_${step.id}_query_params`}
                                                name={`step_${step.id}_query_params`}
                                                defaultValue={formatJson(
                                                    step.query_params
                                                )}
                                                rows={4}
                                                placeholder="{}"
                                                className="mt-2 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-3 font-mono text-xs leading-5 text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>

                                        <div className="mt-5">
                                            <label
                                                htmlFor={`step_${step.id}_body`}
                                                className="text-xs font-medium text-zinc-500"
                                            >
                                                Request Body
                                            </label>

                                            <textarea
                                                id={`step_${step.id}_body`}
                                                name={`step_${step.id}_body`}
                                                defaultValue={formatJson(
                                                    step.body
                                                )}
                                                rows={8}
                                                placeholder="{}"
                                                className="mt-2 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-3 font-mono text-xs leading-5 text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {steps.length === 0 && (
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
            </form>
        </>
    );
}