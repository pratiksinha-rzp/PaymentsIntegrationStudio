"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Credential = {
    id: string;
    name: string;
    environment: string;
    key_id: string;
};

type RunScenarioButtonProps = {
    scenarioId: string;
    environment: string;
};

export default function RunScenarioButton({
    scenarioId,
    environment,
}: RunScenarioButtonProps) {
    const router = useRouter();

    const [credentials, setCredentials] = useState<
        Credential[]
    >([]);
    const [selectedCredential, setSelectedCredential] =
        useState("");
    const [loadingCredentials, setLoadingCredentials] =
        useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadCredentials() {
            try {
                const response = await fetch(
                    "/api/credentials",
                    {
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.error ||
                            "Failed to load credentials"
                    );
                }

                const availableCredentials: Credential[] =
                    Array.isArray(data) ? data : [];

                setCredentials(
                    availableCredentials
                );

                const matchingCredential =
                    availableCredentials.find(
                        (credential) =>
                            credential.environment.toLowerCase() ===
                            environment.toLowerCase()
                    );

                if (matchingCredential) {
                    setSelectedCredential(
                        matchingCredential.id
                    );
                } else if (
                    availableCredentials.length > 0
                ) {
                    setSelectedCredential(
                        availableCredentials[0].id
                    );
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load credentials"
                );
            } finally {
                setLoadingCredentials(false);
            }
        }

        loadCredentials();
    }, [environment]);

    async function handleRun() {
        if (!selectedCredential) {
            setError(
                "Please select a credential before running the scenario."
            );
            return;
        }

        setIsRunning(true);
        setError("");

        try {
            const response = await fetch(
                "/api/scenarios/run",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        scenario_id: scenarioId,
                        credential_id:
                            selectedCredential,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        "Failed to run scenario"
                );
            }

            if (!data.execution_id) {
                throw new Error(
                    "Scenario ran successfully but no execution ID was returned."
                );
            }

            router.push(
                `/executions/${data.execution_id}`
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to run scenario"
            );
        } finally {
            setIsRunning(false);
        }
    }

    return (
        <div className="flex items-center gap-2">
            <select
                value={selectedCredential}
                onChange={(event) =>
                    setSelectedCredential(
                        event.target.value
                    )
                }
                disabled={
                    loadingCredentials ||
                    isRunning ||
                    credentials.length === 0
                }
                className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm outline-none transition focus:border-[#2f80ed] disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
            >
                {loadingCredentials ? (
                    <option value="">
                        Loading credentials...
                    </option>
                ) : credentials.length === 0 ? (
                    <option value="">
                        No credentials available
                    </option>
                ) : (
                    credentials.map((credential) => (
                        <option
                            key={credential.id}
                            value={credential.id}
                        >
                            {credential.name} —{" "}
                            {credential.environment}
                        </option>
                    ))
                )}
            </select>

            <button
                type="button"
                onClick={handleRun}
                disabled={
                    loadingCredentials ||
                    isRunning ||
                    !selectedCredential
                }
                className="rounded-lg bg-[#2f80ed] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256fd1] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isRunning ? "Running..." : "Run"}
            </button>

            {error && (
                <p className="max-w-xs text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}