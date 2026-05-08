import os
from dotenv import load_dotenv
from google import genai
from models import MealAnalysis
from tenacity import retry, stop_after_attempt, wait_exponential


load_dotenv()

api_key = os.getenv("YOUR_GEMINI_API_KEY")

if not api_key:
    raise ValueError("YOUR_GEMINI_API_KEY is not set in the environment!")

client = genai.Client(api_key=api_key)


@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=2, max=10),
)
async def analyze_meal_with_ai(description: str) -> MealAnalysis:
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=f"Analyze this meal: {description}",
        config={
            "response_mime_type": "application/json",
            "response_schema": MealAnalysis,
        },
    )

    return response.parsed
