import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { scenario_id } = body;

        if (!scenario_id) {
            return NextResponse.json(
                {
                    error: "scenario_id is required",
                },
                { status: 400 }
            );
        }

        const response = await fetch(
            `http://127.0.0.1:8080/api/v1/scenarios/${scenario_id}/clone`,
            {
                method: "POST",
                cache: "no-store",
            }
        );

        const data = await response.json();

        return NextResponse.json(
            data,
            { status: response.status }
        );
    } catch (error) {
        console.error(
            "Failed to clone scenario:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to clone scenario",
            },
            { status: 500 }
        );
    }
}
