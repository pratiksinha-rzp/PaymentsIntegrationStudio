import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch(
            "http://127.0.0.1:8080/api/v1/credentials",
            {
                cache: "no-store",
            }
        );

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error("Failed to fetch credentials:", error);

        return NextResponse.json(
            {
                error: "Failed to fetch credentials",
            },
            {
                status: 500,
            }
        );
    }
}