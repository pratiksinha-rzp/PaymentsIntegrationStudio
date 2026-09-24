import Sidebar from "@/components/Sidebar";

type Execution = {
  id: string;
  scenario_id: string;
  scenario_name: string;
  credential_id: string;
  status: string;
  trigger_type: string;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  step_count?: number;
};

type Scenario = {
  id: string;
  name: string;
  description?: string;
  environment: string;
  status: string;
};

type RecentExecution = {
  id: string;
  scenario: string;
  status: string;
  duration: string;
  time: string;
};

function formatDuration(durationMs?: number) {
  if (durationMs === undefined || durationMs === null) {
    return "0ms";
  }

  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  return `${(durationMs / 1000).toFixed(1)}s`;
}

function formatTimeAgo(dateString?: string) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);
  const now = new Date();

  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return "Just now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function normalizeExecutions(data: Execution[]): RecentExecution[] {
  return data.slice(0, 5).map((execution) => {
    let status = "Pending";

    if (execution.status === "success") {
      status = "Completed";
    } else if (execution.status === "failed") {
      status = "Failed";
    } else if (execution.status === "running") {
      status = "Running";
    }

    return {
      id: execution.id.slice(0, 8),
      scenario: execution.scenario_name || "Unnamed Scenario",
      status,
      duration: formatDuration(execution.duration_ms),
      time: formatTimeAgo(execution.started_at),
    };
  });
}

function StatusBadge({ status }: { status: string }) {
  const success =
    status === "Completed" ||
    status === "Success";

  const failed =
    status === "Failed";

  const running =
    status === "Running";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold ${
        success
          ? "bg-emerald-100 text-emerald-700"
          : failed
            ? "bg-red-100 text-red-700"
            : running
              ? "bg-blue-100 text-blue-700"
              : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {status}
    </span>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accentText,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  accentText?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-600">
            {title}
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-800">
            {value}
          </p>

          <p className="mt-1.5 text-xs text-zinc-400">
            {accentText ? (
              <span className="font-medium text-emerald-500">
                {accentText}
              </span>
            ) : (
              subtitle
            )}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  let executions: Execution[] = [];
  let executionsToday = 0;
  let totalScenarios = 0;
  let successRate = 0;

  try {
    const executionResponse = await fetch(
      "http://127.0.0.1:8080/api/v1/executions",
      {
        cache: "no-store",
      }
    );

    if (executionResponse.ok) {
      const data: Execution[] =
        await executionResponse.json();

      executions = Array.isArray(data) ? data : [];

      const today = new Date().toLocaleDateString(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
        }
      );

      executionsToday = executions.filter(
        (execution) => {
          if (!execution.started_at) {
            return false;
          }

          const executionDate = new Date(
            execution.started_at
          ).toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
          });

          return executionDate === today;
        }
      ).length;

      const last24Hours =
        Date.now() - 24 * 60 * 60 * 1000;

      const last24HourExecutions =
        executions.filter((execution) => {
          if (!execution.started_at) {
            return false;
          }

          return (
            new Date(
              execution.started_at
            ).getTime() >= last24Hours
          );
        });

      if (last24HourExecutions.length > 0) {
        const successfulExecutions =
          last24HourExecutions.filter(
            (execution) =>
              execution.status === "success"
          ).length;

        successRate =
          (successfulExecutions /
            last24HourExecutions.length) *
          100;
      }
    }
  } catch (error) {
    console.error(
      "Failed to fetch executions:",
      error
    );
  }

  try {
    const scenarioResponse = await fetch(
      "http://127.0.0.1:8080/api/v1/scenarios",
      {
        cache: "no-store",
      }
    );

    if (scenarioResponse.ok) {
      const scenarios: Scenario[] =
        await scenarioResponse.json();

      totalScenarios = Array.isArray(scenarios)
        ? scenarios.length
        : 0;
    }
  } catch (error) {
    console.error(
      "Failed to fetch scenarios:",
      error
    );
  }

  const recentExecutions =
    normalizeExecutions(executions);

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-zinc-900">
      <div className="flex min-h-screen">
        {/* Shared Sidebar */}
        <Sidebar activeItem="Dashboard" />

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Header */}
          <header className="flex min-h-[86px] items-center justify-between border-b border-zinc-200 bg-white px-7 lg:px-9">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
                Welcome back, Pratik Sinha
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Replay APIs, configure scenario builders, and debug Razorpay payment flows.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/scenarios/new"
                className="flex items-center gap-2 rounded-lg bg-[#2f80ed] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256fd1]"
              >
                <span className="text-lg leading-none">
                  +
                </span>

                New Scenario
              </a>

              <a
                href="/api-replay"
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
              >
                Replay API
              </a>
            </div>
          </header>

          <div className="p-6 lg:p-7">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Scenarios"
                value={String(totalScenarios)}
                subtitle="Live workspace count"
                accentText="Configured scenarios"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M4 6.5h16v13H4z" />
                    <path d="M8 6.5V4h8v2.5" />
                    <path d="M8 11h8M8 15h5" />
                  </svg>
                }
              />

              <StatCard
                title="Executions Today"
                value={String(executionsToday)}
                subtitle="Based on today's executions"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M4 18V6" />
                    <path d="M4 18h16" />
                    <path d="m7 15 3-4 3 2 5-6" />
                  </svg>
                }
              />

              <StatCard
                title="Success Rate %"
                value={`${successRate.toFixed(1)}%`}
                subtitle="Last 24 hours"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="m8.5 12 2.2 2.2 4.8-5" />
                  </svg>
                }
              />

              <StatCard
                title="Active Workers"
                value="4"
                subtitle="Configured local workers"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="2"
                    />
                    <path d="M8 8h8v8H8z" />
                    <path d="M9 1v3M15 1v3M9 20v3M15 20v3" />
                  </svg>
                }
              />
            </div>

            {/* Recent Executions */}
            <section className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">
                    Recent Executions
                  </h2>

                  <p className="mt-0.5 text-xs text-zinc-400">
                    Latest scenario runs
                  </p>
                </div>

                <a
                  href="/executions"
                  className="text-xs font-semibold text-[#2f80ed] hover:text-[#256fd1]"
                >
                  View History →
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/60">
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                        Scenario Name
                      </th>

                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                        Status
                      </th>

                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                        Duration
                      </th>

                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                        Timestamp
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentExecutions.length > 0 ? (
                      recentExecutions.map(
                        (execution) => (
                          <tr
                            key={execution.id}
                            className="border-b border-zinc-100 last:border-b-0"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {execution.scenario}
                                </p>

                                <p className="mt-0.5 font-mono text-[11px] text-zinc-400">
                                  #{execution.id}
                                </p>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <StatusBadge
                                status={execution.status}
                              />
                            </td>

                            <td className="px-6 py-4 text-sm text-zinc-600">
                              {execution.duration}
                            </td>

                            <td className="px-6 py-4 text-sm text-zinc-400">
                              {execution.time}
                            </td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-16 text-center text-sm text-zinc-400"
                        >
                          No executions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}