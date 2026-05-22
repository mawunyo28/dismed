import { NextRequest, NextResponse } from "next/server"
import { check_symptoms } from "@/lib/gemini/gemini"   // adjust the import path to wherever you place gemini.ts

export async function POST(req: NextRequest) {
    try {
        const {
            description,
            temperature_celsius,
            bp,
            primarySymptom,
            duration,
            severity,
            pain_scale,
        } = await req.json()

        const result = await check_symptoms(
            description,
            temperature_celsius,
            bp,
            primarySymptom,
            duration,
            severity,
            pain_scale,
        )

        return NextResponse.json(result)
    } catch (err: unknown) {
        console.error("[check-symptoms]", err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Analysis failed." },
            { status: 500 },
        )
    }
}