import { redirect } from "next/navigation";

async function createScenario(formData: FormData) {
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

    const response = await fetch(
        "http://127.0.0.1:8080/api/v1/scenarios",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                description,
                environment,
            }),
        }
    );

    if (!response.ok) {
        const errorText =
            await response.text();

        throw new Error(
            errorText ||
                "Failed to create scenario"
        );
    }

    const scenario = await response.json();

    redirect(
        `/scenarios/${scenario.id}`
    );
}

export default function NewScenarioPage() {
    return (
        <>
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

                        <span className="text-sm text-zinc-500">
                            New
                        </span>
                    </div>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-800">
                        Create New Scenario
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Create a reusable API workflow
                    </p>
                </div>
            </header>

            <div className="max-w-4xl p-6 lg:p-7">
                <form action={createScenario}>
                    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <div>
                            <h2 className="text-base font-semibold text-slate-800">
                                Scenario Details
                            </h2>

                            <p className="mt-0.5 text-xs text-zinc-400">
                                Define the basic configuration for your scenario
                            </p>
                        </div>

                        <div className="mt-6 space-y-5">
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
                                    placeholder="e.g. Payment Capture Flow"
                                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                    required
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
                                    defaultValue="test"
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

                            <div>
                                <label
                                    htmlFor="description"
                                    className="text-xs font-medium text-zinc-500"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    rows={5}
                                    placeholder="Describe what this scenario is used for..."
                                    className="mt-2 w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>
                    </section>

                    <div className="mt-5 flex justify-end gap-3">
                        <a
                            href="/scenarios"
                            className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                        >
                            Cancel
                        </a>

                        <button
                            type="submit"
                            className="rounded-lg bg-[#2f80ed] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256fd1]"
                        >
                            Create Scenario
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}