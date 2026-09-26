"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CloneScenarioButtonProps = {
    scenarioId: string;
};

export default function CloneScenarioButton({
    scenarioId,
}: CloneScenarioButtonProps) {
    const router = useRouter();

    const [isCloning, setIsCloning] = useState(false);
    const [error, setError] = useState("");

    async function handleClone() {
        setIsCloning(true);
        setError("");

        try {
            const response = await fetch(
                "/api/scenarios/clone",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        scenario_id: scenarioId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        "Failed to clone scenario"
                );
            }

            if (!data.id) {
                throw new Error(
                    "Scenario cloned but no scenario ID was returned."
                );
            }

            router.push(`/scenarios/${data.id}`);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to clone scenario"
            );
        } finally {
            setIsCloning(false);
        }
    }

    return (
        <div className="flex flex-col items-end gap-2">
            <button
                type="button"
                onClick={handleClone}
                disabled={isCloning}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isCloning ? "Cloning..." : "Clone"}
            </button>

            {error && (
                <p className="max-w-xs text-right text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
