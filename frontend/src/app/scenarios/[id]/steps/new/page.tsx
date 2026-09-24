import { redirect } from "next/navigation";

async function createStep(
    scenarioID: string,
    formData: FormData
) {
    "use server";

    const name = String(
        formData.get("name") ?? ""
    ).trim();

    const method = String(
        formData.get("method") ?? "GET"
    ).trim();

    const url = String(
        formData.get("url") ?? ""
    ).trim();

    const variablePrefix = String(
        formData.get("variable_prefix") ?? ""
    ).trim();

    const headersText = String(
        formData.get("headers") ?? ""
    );

    const queryParamsText = String(
        formData.get("query_params") ?? ""
    );

    const bodyText = String(
        formData.get("body") ?? ""
    );

    if (!name) {
        throw new Error(
            "Step name is required"
        );
    }

    if (!url) {
        throw new Error(
            "Endpoint is required"
        );
    }

    function parseJSON(
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
                throw new Error();
            }

            return parsed;
        } catch {
            throw new Error(
                `Invalid JSON in ${fieldName}`
            );
        }
    }

    const headers = parseJSON(
        headersText,
        "Headers"
    );

    const queryParams = parseJSON(
        queryParamsText,
        "Query Parameters"
    );

    const body =
        bodyText.trim()
            ? parseJSON(
                  bodyText,
                  "Request Body"
              )
            : null;

    /*
     * Get existing steps so the new step is
     * appended at the end of the workflow.
     */
    const existingStepsResponse =
        await fetch(
            `http://127.0.0.1:8080/api/v1/scenarios/${scenarioID}/steps`,
            {
                cache: "no-store",
            }
        );

    if (!existingStepsResponse.ok) {
        throw new Error(
            "Failed to fetch existing scenario steps"
        );
    }

    const existingSteps =
        await existingStepsResponse.json();

    const stepOrder =
        Array.isArray(existingSteps)
            ? existingSteps.length + 1
            : 1;

    const response = await fetch(
        `http://127.0.0.1:8080/api/v1/scenarios/${scenarioID}/steps`,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify({
                scenario_id: scenarioID,
                step_order: stepOrder,
                name,
                method,
                url,
                variable_prefix:
                    variablePrefix,
                headers,
                query_params:
                    queryParams,
                body,
            }),
        }
    );

    if (!response.ok) {
        const errorText =
            await response.text();

        throw new Error(
            errorText ||
                "Failed to create scenario step"
        );
    }

    redirect(
        `/scenarios/${scenarioID}`
    );
}

export default async function NewScenarioStepPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    async function action(formData: FormData) {
        "use server";

        await createStep(id, formData);
    }

    return (
        <>
            {/* Header */}
            <header className="border-b border-zinc-200 bg-white px-7 py-5 lg:px-9">
                <div className="flex items-center gap-2">
                    <a
                        href={`/scenarios/${id}`}
                        className="text-sm text-zinc-400 transition hover:text-zinc-700"
                    >
                        Scenario
                    </a>

                    <span className="text-zinc-300">
                        /
                    </span>

                    <span className="text-sm text-zinc-500">
                        New Step
                    </span>
                </div>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-800">
                    Add API Step
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                    Configure an API request for this scenario
                </p>
            </header>

            <div className="max-w-5xl p-6 lg:p-7">
                <form action={action}>
                    {/* Request Configuration */}
                    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <div>
                            <h2 className="text-base font-semibold text-slate-800">
                                Request Configuration
                            </h2>

                            <p className="mt-0.5 text-xs text-zinc-400">
                                Define the API request
                            </p>
                        </div>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">
                            {/* Step Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="text-xs font-medium text-zinc-500"
                                >
                                    Step Name
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    placeholder="e.g. Create Order"
                                    required
                                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Method */}
                            <div>
                                <label
                                    htmlFor="method"
                                    className="text-xs font-medium text-zinc-500"
                                >
                                    Method
                                </label>

                                <select
                                    id="method"
                                    name="method"
                                    defaultValue="GET"
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

                            {/* Endpoint */}
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="url"
                                    className="text-xs font-medium text-zinc-500"
                                >
                                    Endpoint
                                </label>

                                <input
                                    id="url"
                                    name="url"
                                    placeholder="/v1/orders"
                                    required
                                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-xs text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Variable Prefix */}
                            <div>
                                <label
                                    htmlFor="variable_prefix"
                                    className="text-xs font-medium text-zinc-500"
                                >
                                    Variable Prefix
                                </label>

                                <input
                                    id="variable_prefix"
                                    name="variable_prefix"
                                    placeholder="e.g. order"
                                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-xs text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Headers */}
                    <section className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-900">
                                Headers
                            </h2>

                            <p className="mt-0.5 text-xs text-zinc-400">
                                Request headers as a JSON object
                            </p>
                        </div>

                        <textarea
                            id="headers"
                            name="headers"
                            rows={6}
                            defaultValue={"{}"}
                            className="mt-4 w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 font-mono text-xs leading-5 text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                        />
                    </section>

                    {/* Query Parameters */}
                    <section className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-900">
                                Query Parameters
                            </h2>

                            <p className="mt-0.5 text-xs text-zinc-400">
                                Query parameters as a JSON object
                            </p>
                        </div>

                        <textarea
                            id="query_params"
                            name="query_params"
                            rows={5}
                            defaultValue={"{}"}
                            className="mt-4 w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 font-mono text-xs leading-5 text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                        />
                    </section>

                    {/* Request Body */}
                    <section className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-900">
                                Request Body
                            </h2>

                            <p className="mt-0.5 text-xs text-zinc-400">
                                Request body as a JSON object
                            </p>
                        </div>

                        <textarea
                            id="body"
                            name="body"
                            rows={10}
                            defaultValue={"{}"}
                            className="mt-4 w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 font-mono text-xs leading-5 text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                        />
                    </section>

                    {/* Actions */}
                    <div className="mt-5 flex justify-end gap-3">
                        <a
                            href={`/scenarios/${id}`}
                            className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                        >
                            Cancel
                        </a>

                        <button
                            type="submit"
                            className="rounded-lg bg-[#2f80ed] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256fd1]"
                        >
                            Add Step
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}