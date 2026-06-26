import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function check_symptoms(
  description: string,
  temperature_celsius: number,
  bp: string,
  primarySymptom: string,
  duration: number,
  severity: string,
  pain_scale: number,
) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are an advanced clinical decision support AI designed to assist healthcare professionals by analyzing patient vitals and symptoms. Your task is to process the provided patient data and return a structured health analysis strictly in JSON format.

Analyze the following patient data:
- Temperature: ${temperature_celsius}°C
- Blood Pressure: ${bp} mmHg
- Primary Symptom: ${primarySymptom}
- Duration: ${duration} days
- Severity: ${severity} (Pain scale: ${pain_scale}/10)
- Additional description: ${description}

Your JSON response must include the following keys:
1. "detected_indicators": An array of objects detailing abnormal vitals or symptoms (e.g., low-grade fever), their clinical significance, and immediate recommended actions for the patient.
2. "risk_level": A string categorizing the overall risk (e.g., Low, Moderate, Severe, Critical).
3. "technical_analysis": A detailed clinical reasoning of potential underlying etiologies (differential diagnosis) based on the cluster of symptoms.
4. "certainty_score": A percentage or scale reflecting your confidence in the preliminary analysis given the current data limitations.

Constraints:
- Do not include any conversational filler, markdown formatting (outside of the json code block), or introductory text.
- Return ONLY the valid JSON object.
- Include a standard medical disclaimer within the JSON.
- Showed be understandable as being presented to the patient not the medical officer

Expected JSON Structure:
{
  "detected_indicators": [
    {
      "indicator": "string",
      "status": "string",
      "recommended_action": "string"
    }
  ],
  "risk_level": "string",
  "technical_analysis": {
    "clinical_reasoning": "string",
    "differential_considerations": ["string", "string"]
  },
  "certainty_score": "string",
  "disclaimer": "string"
}`,
  });

  const raw = response.text ?? "";

  // Strip optional markdown code fences the model may include
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  return JSON.parse(cleaned);
}
