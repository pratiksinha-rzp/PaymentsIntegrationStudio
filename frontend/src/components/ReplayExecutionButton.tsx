"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ReplayExecutionButtonProps = {
    executionId: string;
    triggerType: string;
    credentialId?: string;
    method: string;
    url: string;
    headers?: Record<string, unknown>;
    queryParams?: Record<string, unknown>;
    body?: Record<string, unknown>;
};

export default function ReplayExecutionButton({
    executionId,
    triggerType,
    credentialId,
    method,
    url,
    headers,
    queryParams,
    body,
}: ReplayExecutionButtonProps) {
    const router = useRouter();

    const [isReplaying, setIsReplaying] = useState(false);
    const [error, setError] = useState("");

    async function handleReplay() {
        setIsReplaying(true);
        setError("");

        try {
            const isWebhookReplay =
                triggerType === "webhook_replay";

            const endpoint = isWebhookReplay
                ? "/api/webhooks/replay"
                : "/api/replay";

            const requestBody = isWebhookReplay
                ? {
                      method,
                      url,
                      headers: headers ?? {},
                      query_params: queryParams ?? {},
                      body: body ?? {},
                  }
                : {
                      method,
                      url,
                      headers: headers ?? {},
                      query_params: queryParams ?? {},
                      body: body ?? {},
                      credential_id: credentialId ?? "",
                  };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        `Replay failed with status ${response.status}`
                );
            }

            if (!data.execution_id) {
                throw new Error(
                    "Replay succeeded but no execution ID was returned."
                );
            }

            router.push(`/executions/${data.execution_id}`);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to replay execution."
            );
        } finally {
            setIsReplaying(false);
        }
    }

    return (
        <div className="flex flex-col items-end gap-2">
            <button
                type="button"
                onClick={handleReplay}
                disabled={isReplaying}
                className="rounded-lg bg-[#2f80ed] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#256fd1] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isReplaying ? "Replaying..." : "Replay"}
            </button>

            {error && (
                <p className="max-w-xs text-right text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}