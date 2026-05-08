import type { AnalyzeResponse } from "../types/nutrition"

const API_URL = "http://127.0.0.1:8000/analyze"

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function analyzeMeal(
  mealDescription: string,
): Promise<AnalyzeResponse> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      meal_description: mealDescription,
    }),
  })

  if (!response.ok) {
    const serverMessage = await response
      .json()
      .then((data: { detail?: string }) => data.detail ?? "")
      .catch(() => "")

    const fallbackMessage =
      response.status === 429
        ? "Too many requests right now. Please wait a moment and try again."
        : response.status === 503
          ? "The AI service is temporarily unavailable. Please retry shortly."
          : "Something went wrong while analyzing your meal."

    throw new ApiError(serverMessage || fallbackMessage, response.status)
  }

  return (await response.json()) as AnalyzeResponse
}
