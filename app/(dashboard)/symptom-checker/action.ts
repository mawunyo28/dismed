"use server"

import { check_symptoms } from "@/lib/gemini/gemini"

export async function runSymptomAnalysis(payload: {
    description: string
    temperature_celsius: number
    bp: string
    primarySymptom: string
    duration: number
    severity: string
    pain_scale: number
}) {
    return await check_symptoms(
        payload.description,
        payload.temperature_celsius,
        payload.bp,
        payload.primarySymptom,
        payload.duration,
        payload.severity,
        payload.pain_scale,
    )
}