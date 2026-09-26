"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

type Tab = "headers" | "params" | "body";

type ReplayResult = {
    execution_id: string;
    status: string;
    status_code: number;
    headers: Record<string, string>;
    body: unknown;
    latency_ms: number;
};

export default function WebhooksPage() {
    const [method, setMethod] = useState("POST");
    const [url, setUrl] = useState("");
    const [activeTab, setActiveTab] = useState<Tab>("body");

    const [headers, setHeaders] = useState(
        JSON.stringify(
            {
                "Content-Type": "application/json",
                "X-Razorpay-Event": "payment.captured",
            },
            null,
            2
        )
    );

    const [queryParams, setQueryParams] = useState("{}");

    const [body, setBody] = useState(
        JSON.stringify(
            {
                entity: "event",
                account_id: "acc_xxxxxxxxxxxxx",
                event: "payment.captured",
                contains: ["payment"],
                payload: {
                    payment: {
                        entity: {
                            id: "pay_xxxxxxxxxxxxx",
                            amount: 50000,
                            currency: "INR",
                            status: "captured",
                        },
                    },
                },
            },
            null,
            2
        )
    );

    const [isReplaying, setIsReplaying] = useState(false);
    const [replayError, setReplayError] = useState("");
    const [replayResult, setReplayResult] =
        useState<ReplayResult | null>(null);

    const handleReplay = async () => {
        if (!url.trim()) {
            setReplayError("Please enter a webhook endpoint.");
            return;
        }

        setIsReplaying(true);
        setReplayError("");
        setReplayResult(null);

        try {
            const parsedHeaders = JSON.parse(headers);
            const parsedQueryParams = JSON.parse(queryParams);
            const parsedBody = body.trim() ? JSON.parse(body) : {};

            const response = await fetch("/api/webhooks/replay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    method,
                    url,
                    headers: parsedHeaders,
                    query_params: parsedQueryParams,
                    body: parsedBody,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error || "Failed to replay webhook"
                );
            }

            setReplayResult(data);
        } catch (error) {
            if (error instanceof SyntaxError) {
                setReplayError(
                    "Invalid JSON in headers, query parameters, or body."
                );
            } else {
                setReplayError(
                    error instanceof Error
                        ? error.message
                        : "Failed to replay webhook"
                );
            }
        } finally {
            setIsReplaying(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f5f7] text-zinc-900">
            <div className="flex min-h-screen">
                <Sidebar activeItem="Webhooks" />

                <main className="min-w-0 flex-1">
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
                                    Webhooks
                                </span>
                            </div>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-800">
                                Webhook Replay
                            </h1>

                            <p className="mt-1 text-sm text-zinc-500">
                                Send webhook events to an endpoint and inspect the response
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <a
                                href="/executions"
                                className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                            >
                                View History
                            </a>

                            <button
                                type="button"
                                onClick={handleReplay}
                                disabled={isReplaying}
                                className="rounded-lg bg-[#2f80ed] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#256fd1] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isReplaying
                                    ? "Replaying..."
                                    : "Replay Webhook"}
                            </button>
                        </div>
                    </header>

                    <div className="p-6 lg:p-7">
                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                            {/* Webhook Builder */}
                            <section className="rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                                <div className="border-b border-zinc-200 px-5 py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-sm font-semibold text-zinc-900">
                                                Webhook Builder
                                            </h2>

                                            <p className="mt-0.5 text-xs text-zinc-400">
                                                Configure the webhook request before delivery
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                            Outbound
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5">
                                    {/* Method + URL */}
                                    <div className="flex gap-2">
                                        <select
                                            value={method}
                                            onChange={(event) =>
                                                setMethod(event.target.value)
                                            }
                                            className="w-28 shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-xs font-semibold text-zinc-700 outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="POST">
                                                POST
                                            </option>

                                            <option value="PUT">
                                                PUT
                                            </option>

                                            <option value="PATCH">
                                                PATCH
                                            </option>

                                            <option value="GET">
                                                GET
                                            </option>
                                        </select>

                                        <input
                                            value={url}
                                            onChange={(event) =>
                                                setUrl(event.target.value)
                                            }
                                            placeholder="https://your-webhook-endpoint.example/webhook"
                                            className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-xs text-zinc-700 outline-none placeholder:text-zinc-300 focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>

                                    {/* Tabs */}
                                    <div className="mt-6 border-b border-zinc-200">
                                        <div className="flex gap-6">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveTab("headers")
                                                }
                                                className={`border-b-2 pb-3 text-xs font-medium transition ${
                                                    activeTab === "headers"
                                                        ? "border-[#2f80ed] text-[#256fd1]"
                                                        : "border-transparent text-zinc-400 hover:text-zinc-700"
                                                }`}
                                            >
                                                Headers
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveTab("params")
                                                }
                                                className={`border-b-2 pb-3 text-xs font-medium transition ${
                                                    activeTab === "params"
                                                        ? "border-[#2f80ed] text-[#256fd1]"
                                                        : "border-transparent text-zinc-400 hover:text-zinc-700"
                                                }`}
                                            >
                                                Query Params
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveTab("body")
                                                }
                                                className={`border-b-2 pb-3 text-xs font-medium transition ${
                                                    activeTab === "body"
                                                        ? "border-[#2f80ed] text-[#256fd1]"
                                                        : "border-transparent text-zinc-400 hover:text-zinc-700"
                                                }`}
                                            >
                                                Body
                                            </button>
                                        </div>
                                    </div>

                                    {/* Editor */}
                                    <div className="mt-5">
                                        {activeTab === "headers" && (
                                            <>
                                                <div className="mb-2 flex items-center justify-between">
                                                    <p className="text-xs font-medium text-zinc-500">
                                                        Request Headers
                                                    </p>

                                                    <span className="font-mono text-[10px] text-zinc-400">
                                                        JSON
                                                    </span>
                                                </div>

                                                <textarea
                                                    value={headers}
                                                    onChange={(event) =>
                                                        setHeaders(
                                                            event.target.value
                                                        )
                                                    }
                                                    rows={16}
                                                    className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs leading-5 text-zinc-700 outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                                />
                                            </>
                                        )}

                                        {activeTab === "params" && (
                                            <>
                                                <div className="mb-2 flex items-center justify-between">
                                                    <p className="text-xs font-medium text-zinc-500">
                                                        Query Parameters
                                                    </p>

                                                    <span className="font-mono text-[10px] text-zinc-400">
                                                        JSON
                                                    </span>
                                                </div>

                                                <textarea
                                                    value={queryParams}
                                                    onChange={(event) =>
                                                        setQueryParams(
                                                            event.target.value
                                                        )
                                                    }
                                                    rows={16}
                                                    className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs leading-5 text-zinc-700 outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                                />
                                            </>
                                        )}

                                        {activeTab === "body" && (
                                            <>
                                                <div className="mb-2 flex items-center justify-between">
                                                    <p className="text-xs font-medium text-zinc-500">
                                                        Webhook Payload
                                                    </p>

                                                    <span className="font-mono text-[10px] text-zinc-400">
                                                        application/json
                                                    </span>
                                                </div>

                                                <textarea
                                                    value={body}
                                                    onChange={(event) =>
                                                        setBody(
                                                            event.target.value
                                                        )
                                                    }
                                                    rows={16}
                                                    className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs leading-5 text-zinc-700 outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-blue-100"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Configuration + Result */}
                            <div className="space-y-6">
                                <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                                    <div>
                                        <h2 className="text-sm font-semibold text-zinc-900">
                                            Delivery Configuration
                                        </h2>

                                        <p className="mt-0.5 text-xs text-zinc-400">
                                            Review the destination before delivery
                                        </p>
                                    </div>

                                    <div className="mt-5 space-y-5">
                                        <div>
                                            <label className="text-xs font-medium text-zinc-500">
                                                Endpoint
                                            </label>

                                            <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                                                <p className="break-all font-mono text-xs text-zinc-600">
                                                    {url || "No endpoint configured"}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-zinc-500">
                                                Method
                                            </label>

                                            <div className="mt-2 flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2.5">
                                                <span className="font-mono text-xs font-semibold text-zinc-700">
                                                    {method}
                                                </span>

                                                <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] text-zinc-500">
                                                    HTTP
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-zinc-500">
                                                Authentication
                                            </label>

                                            <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                                                <p className="text-xs text-zinc-600">
                                                    No automatic authentication
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                                    <div>
                                        <h2 className="text-sm font-semibold text-zinc-900">
                                            Request Preview
                                        </h2>

                                        <p className="mt-0.5 text-xs text-zinc-400">
                                            Final webhook delivery configuration
                                        </p>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-zinc-400">
                                                Method
                                            </span>

                                            <span className="font-mono text-xs font-semibold text-zinc-700">
                                                {method}
                                            </span>
                                        </div>

                                        <div className="flex items-start justify-between gap-4">
                                            <span className="shrink-0 text-xs text-zinc-400">
                                                Endpoint
                                            </span>

                                            <span className="break-all text-right font-mono text-xs text-zinc-700">
                                                {url || "Not configured"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-zinc-400">
                                                Headers
                                            </span>

                                            <span className="font-mono text-xs font-semibold text-zinc-700">
                                                JSON
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-zinc-400">
                                                Payload
                                            </span>

                                            <span className="font-mono text-xs font-semibold text-zinc-700">
                                                JSON
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                {replayError && (
                                    <section className="rounded-xl border border-red-200 bg-red-50 p-5">
                                        <p className="text-sm font-medium text-red-700">
                                            Replay failed
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-red-600">
                                            {replayError}
                                        </p>
                                    </section>
                                )}

                                {replayResult && (
                                    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                                        <div>
                                            <h2 className="text-sm font-semibold text-zinc-900">
                                                Delivery Result
                                            </h2>

                                            <p className="mt-0.5 text-xs text-zinc-400">
                                                Latest webhook execution
                                            </p>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-zinc-400">
                                                    Status
                                                </span>

                                                <span
                                                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                                                        replayResult.status ===
                                                        "success"
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-red-50 text-red-700"
                                                    }`}
                                                >
                                                    {replayResult.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-zinc-400">
                                                    Status Code
                                                </span>

                                                <span className="font-mono text-xs font-semibold text-zinc-700">
                                                    {replayResult.status_code}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-zinc-400">
                                                    Latency
                                                </span>

                                                <span className="font-mono text-xs font-semibold text-zinc-700">
                                                    {replayResult.latency_ms} ms
                                                </span>
                                            </div>

                                            <div>
                                                <p className="mb-2 text-xs font-medium text-zinc-500">
                                                    Execution ID
                                                </p>

                                                <a
                                                    href={`/executions/${replayResult.execution_id}`}
                                                    className="block break-all rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-[11px] text-blue-600 underline hover:text-blue-700"
                                                >
                                                    {
                                                        replayResult.execution_id
                                                    }
                                                </a>
                                            </div>

                                            <div>
                                                <p className="mb-2 text-xs font-medium text-zinc-500">
                                                    Response Body
                                                </p>

                                                <pre className="max-h-80 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-[11px] leading-5 text-zinc-700">
                                                    {JSON.stringify(
                                                        replayResult.body,
                                                        null,
                                                        2
                                                    )}
                                                </pre>
                                            </div>
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
