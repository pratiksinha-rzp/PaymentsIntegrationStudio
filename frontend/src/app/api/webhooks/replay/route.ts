import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch(
            "http://127.0.0.1:8080/api/v1/replay/webhook",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                cache: "no-store",
            }
        );

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error("Failed to replay webhook:", error);

        return NextResponse.json(
            {
                error: "Failed to replay webhook",
            },
            {
                status: 500,
            }
        );
    }
}
