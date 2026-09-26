import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { scenario_id, credential_id } = body;

        if (!scenario_id || !credential_id) {
            return NextResponse.json(
                {
                    error:
                        "scenario_id and credential_id are required",
                },
                { status: 400 }
            );
        }

        const executionResponse = await fetch(
            "http://127.0.0.1:8080/api/v1/executions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    scenario_id,
                    credential_id,
                    trigger_type: "manual",
                }),
                cache: "no-store",
            }
        );

        const executionData =
            await executionResponse.json();

        if (!executionResponse.ok) {
            return NextResponse.json(
                executionData,
                { status: executionResponse.status }
            );
        }

        const executionId =
            executionData.execution_id ||
            executionData.id;

        if (!executionId) {
            return NextResponse.json(
                {
                    error:
                        "Execution was created but no execution ID was returned.",
                },
                { status: 500 }
            );
        }

        const runResponse = await fetch(
            `http://127.0.0.1:8080/api/v1/executions/${executionId}/run`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    scenario_id,
                    credential_id,
                }),
                cache: "no-store",
            }
        );

        const runData = await runResponse.json();

        if (!runResponse.ok) {
            return NextResponse.json(
                runData,
                { status: runResponse.status }
            );
        }

        return NextResponse.json(
            {
                execution_id: executionId,
                status: runData.status || "success",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "Failed to run scenario:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to run scenario",
            },
            { status: 500 }
        );
    }
}
