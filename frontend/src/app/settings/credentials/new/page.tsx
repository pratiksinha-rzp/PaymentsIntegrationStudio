import { redirect } from "next/navigation";

async function createCredential(
    formData: FormData
) {
    "use server";

    const name = String(
        formData.get("name") ?? ""
    ).trim();

    const environment = String(
        formData.get("environment") ?? "test"
    ).trim();

    const keyId = String(
        formData.get("key_id") ?? ""
    ).trim();

    const keySecret = String(
        formData.get("key_secret") ?? ""
    ).trim();

    if (!name) {
        throw new Error(
            "Credential name is required"
        );
    }

    if (!keyId) {
        throw new Error(
            "Key ID is required"
        );
    }

    if (!keySecret) {
        throw new Error(
            "Key secret is required"
        );
    }

    const response = await fetch(
        "http://127.0.0.1:8080/api/v1/credentials",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                environment,
                key_id: keyId,
                key_secret: keySecret,
            }),
        }
    );

    if (!response.ok) {
        const errorText =
            await response.text();

        throw new Error(
            errorText ||
                "Failed to create credential"
        );
    }

    redirect("/settings");
}

export default function NewCredentialPage() {
    return (
        <>
            {/* Header */}
            <header className="flex min-h-[86px] items-center justify-between border-b border-zinc-200 bg-white px-7 lg:px-9">
                <div>
                    <div className="flex items-center gap-2">
                        <a
                            href="/settings"
                            className="text-sm text-zinc-400 transition hover:text-zinc-700"
                        >
                            Settings
                        </a>

                        <span className="text-zinc-300">
                            /
                        </span>

                        <span className="text-sm text-zinc-500">
                            New Credential
                        </span>
                    </div>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-800">
                        Add Credential
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Add a Razorpay API credential for replay execution
                    </p>
                </div>
            </header>

            <div className="max-w-5xl p-6 lg:p-7">
                <form action={createCredential}>
                    {/* Credential Details */}
                    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <div>
                            <h2 className="text-base font-semibold text-slate-800">
                                Credential Details
                            </h2>

                            <p className="mt-0.5 text-xs text-zinc-400">
                                Configure the API credentials used by replay executions
                            </p>
                        </div>

                        <div className="mt-6 space-y-5">
                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="text-xs font-medium text-zinc-500"
                                >
                                    Credential Name
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    placeholder="e.g. Razorpay Test"
                                    required
                                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Environment */}
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

                            {/* Key ID */}
                            <div>
                                <label
                                    htmlFor="key_id"
                                    className="text-xs font-medium text-zinc-500"
                                >
                                    Key ID
                                </label>

                                <input
                                    id="key_id"
                                    name="key_id"
                                    placeholder="rzp_test_..."
                                    required
                                    autoComplete="off"
                                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-xs text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Key Secret */}
                            <div>
                                <label
                                    htmlFor="key_secret"
                                    className="text-xs font-medium text-zinc-500"
                                >
                                    Key Secret
                                </label>

                                <input
                                    id="key_secret"
                                    name="key_secret"
                                    type="password"
                                    placeholder="Enter secret key"
                                    required
                                    autoComplete="new-password"
                                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                />

                                <p className="mt-2 text-[11px] leading-5 text-zinc-400">
                                    The secret is submitted to the backend and is not displayed in the credentials list.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Credential Handling */}
                    <section className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5">
                        <div className="flex gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-4 w-4"
                                >
                                    <path d="m12 3 9 17H3L12 3Z" />
                                    <path d="M12 9v4M12 17h.01" />
                                </svg>
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold text-amber-800">
                                    Credential Handling
                                </h2>

                                <p className="mt-1 text-xs leading-5 text-amber-700">
                                    Use the appropriate environment for the credential. For initial development and testing, use a Test credential.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="mt-5 flex justify-end gap-3">
                        <a
                            href="/settings"
                            className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                        >
                            Cancel
                        </a>

                        <button
                            type="submit"
                            className="rounded-lg bg-[#2f80ed] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256fd1]"
                        >
                            Save Credential
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}